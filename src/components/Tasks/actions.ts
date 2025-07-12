"use server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { type Task, type Session } from "@/types";

import { db } from "@/drizzle";
import { sessions, tasks, workTime } from "@/drizzle/schema";

export interface TaskStats {
  taskId: number;
  total_time_spent: number;
  longest_session: number;
  // think about whant kinda stats are needed
}

export interface SparklineData {
  taskId: number;
  day: number;
  hours: number;
}

export interface TaskWithStatsAndSparkline {
  id: number;
  name: string;
  status: "active" | "not_active" | "completed";
  updatedAt: Date;
  createdAt: Date;
  userId: string;
  taskStats: TaskStats;
  sparklineData: SparklineData[];
}

export async function getTasksWithStatsAndSparkline(): Promise<
  TaskWithStatsAndSparkline[]
> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const tasksWithStats = await db
    .select({
      id: tasks.id,
      name: tasks.name,
      status: tasks.status,
      updatedAt: tasks.updatedAt,
      createdAt: tasks.createdAt,
      userId: tasks.userId,
      total_time_spent: sql<number>`COALESCE(SUM(EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt}))), 0)`,
      longest_session: sql<number>`COALESCE(MAX(EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt}))), 0)`,
    })
    .from(tasks)
    .leftJoin(sessions, eq(tasks.id, sessions.taskId))
    .where(eq(tasks.userId, userId))
    .groupBy(
      tasks.id,
      tasks.name,
      tasks.status,
      tasks.updatedAt,
      tasks.createdAt,
      tasks.userId,
    )
    .orderBy(tasks.updatedAt);

  // day 30 = today, day 29 = yesterday, etc.
  const sparklineResults = await db
    .select({
      taskId: sessions.taskId,
      day: sql<number>`30 - FLOOR(EXTRACT(EPOCH FROM (NOW() - ${sessions.startedAt})) / 86400)`,
      hours: sql<number>`SUM(EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt}))) / 3600`,
    })
    .from(sessions)
    .innerJoin(tasks, eq(sessions.taskId, tasks.id))
    .where(
      and(
        eq(tasks.userId, userId),
        sql`${sessions.startedAt} >= NOW() - INTERVAL '30 days'`,
        sql`${sessions.endedAt} IS NOT NULL`,
      ),
    )
    .groupBy(
      sessions.taskId,
      sql`30 - FLOOR(EXTRACT(EPOCH FROM (NOW() - ${sessions.startedAt})) / 86400)`,
    );

  // console.log(sparklineResults);
  // Combine the results
  return tasksWithStats.map((task) => {
    const taskSparklineData = sparklineResults.filter(
      (s) => s.taskId === task.id,
    );
    // console.log("TASK SPARKLINE DATA", taskSparklineData);
    const sparklineData = fillMissingDays(taskSparklineData, task.id);
    // console.log("SPARKLINE DATA", sparklineData);
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
      userId: task.userId,
      taskStats: {
        taskId: task.id,
        total_time_spent: task.total_time_spent,
        longest_session: task.longest_session,
      },
      sparklineData,
    };
  });
}

function fillMissingDays(
  sparklineData: SparklineData[],
  taskId: number,
): SparklineData[] {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return days.map((day) => {
    const dayData = sparklineData.find((d) => d.day == day);
    // console.log("DAY DATA", dayData);
    return {
      taskId,
      day: Number(dayData?.day || day),
      hours: Number(dayData?.hours || 0),
    };
  });
}

export async function createTask(name: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!name.trim()) {
    throw new Error("Task name is required");
  }

  try {
    await db.insert(tasks).values({
      userId,
      name: name.trim(),
      status: "not_active",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add task:", error);
    throw new Error("Failed to add task");
  }
}

export async function updateTaskName(taskId: number, newName: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!newName.trim()) {
    throw new Error("Task name is required");
  }

  try {
    await db
      .update(tasks)
      .set({
        name: newName,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit task:", error);
    throw new Error("Failed to edit task");
  }
}

export async function deleteTask(task: Task) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  let closedActiveSession: Session | undefined = undefined;

  try {
    if (task.status === "active") {
      const result = await db
        .update(sessions)
        .set({
          endedAt: new Date(),
        })
        .where(and(eq(sessions.taskId, task.id), isNull(sessions.endedAt)))
        .returning();

      closedActiveSession = result[0] as Session;
    }

    await db.delete(sessions).where(eq(sessions.taskId, task.id));

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, task.id), eq(tasks.userId, userId)));

    if (closedActiveSession) {
      await addClosedSessionTime(closedActiveSession);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
}

export async function toggleTaskStatus(taskId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // db: source of truth for active task
  const activeTask = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.status, "active"), eq(tasks.userId, userId)))
    .limit(1)
    .then((res) => (res.length > 0 ? res[0] : undefined));

  let closedActiveSession: Session | undefined = undefined;

  try {
    if (activeTask && activeTask.id === taskId) {
      // deactivate task
      // end the task session

      const [result] = await Promise.all([
        db
          .update(sessions)
          .set({
            endedAt: new Date(),
          })
          .where(
            and(eq(sessions.taskId, taskId), isNull(sessions.endedAt)),
          )
          .returning(),
        db
          .update(tasks)
          .set({
            status: "not_active",
          })
          .where(eq(tasks.id, taskId)),
      ]);

      closedActiveSession = result[0] as Session;
    } else if (activeTask && activeTask.id !== taskId) {
      // end session for the active task
      // deactivate the active task
      // activate the task
      // start a new session for task

      const [result] = await Promise.all([
        db
          .update(sessions)
          .set({
            endedAt: new Date(),
          })
          .where(
            and(
              eq(sessions.taskId, activeTask.id),
              isNull(sessions.endedAt),
            ),
          )
          .returning(),
        db
          .update(tasks)
          .set({
            status: "not_active",
          })
          .where(eq(tasks.id, activeTask.id)),
        db
          .update(tasks)
          .set({
            status: "active",
          })
          .where(eq(tasks.id, taskId)),
        db.insert(sessions).values({
          taskId,
          userId,
          startedAt: new Date(),
        }),
      ]);

      closedActiveSession = result[0] as Session;
    } else if (!activeTask) {
      // activate the task and start a new session in parallel
      await Promise.all([
        db
          .update(tasks)
          .set({
            status: "active",
          })
          .where(eq(tasks.id, taskId)),
        db.insert(sessions).values({
          taskId,
          userId,
          startedAt: new Date(),
        }),
      ]);
    }

    if (closedActiveSession) {
      await addClosedSessionTime(closedActiveSession);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle working status:", error);
    throw new Error("Failed to toggle working status");
  }
}

export async function completeTask(task: Task) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  let closedActiveSession: Session | undefined = undefined;

  try {
    if (task.status === "active") {
      const result = await db
        .update(sessions)
        .set({
          endedAt: new Date(),
        })
        .where(and(eq(sessions.taskId, task.id), isNull(sessions.endedAt)))
        .returning();

      closedActiveSession = result[0] as Session;
    }

    await db
      .update(tasks)
      .set({
        status: "completed",
      })
      .where(and(eq(tasks.id, task.id), eq(tasks.userId, userId)));

    if (closedActiveSession) {
      await addClosedSessionTime(closedActiveSession);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete task:", error);
    throw new Error("Failed to complete task");
  }
}

// this is not working on server because of the timezone issue
// it works in dev because the server is running in the same timezone as the client
// TODO: fix this
export async function addClosedSessionTime(closedActiveSession: Session) {
  console.log(closedActiveSession);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    throw new Error("Timezone not found");
  }
  const userDay = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone,
  });

  const sessionStartedAtDayLocal = new Date(
    closedActiveSession.startedAt,
  ).toLocaleDateString("en-CA", {
    timeZone: timezone,
  });

  const dailyTimeMap: Record<string, number> = {};

  const startDate = new Date(closedActiveSession.startedAt);
  const endDate = new Date(closedActiveSession.endedAt);

  const startDateLocal = new Date(startDate).toLocaleDateString("en-CA", {
    timeZone: timezone,
  });
  const endDateLocal = new Date(endDate).toLocaleDateString("en-CA", {
    timeZone: timezone,
  });

  let currentDate = new Date(startDateLocal + "T00:00:00");
  const finalDate = new Date(endDateLocal + "T00:00:00");

  while (currentDate <= finalDate) {
    const currentDateStr = currentDate.toLocaleDateString("en-CA");

    let dayStartTime: Date;
    let dayEndTime: Date;

    if (
      currentDateStr === startDateLocal &&
      currentDateStr === endDateLocal
    ) {
      dayStartTime = startDate;
      dayEndTime = endDate;
    } else if (currentDateStr === startDateLocal) {
      dayStartTime = startDate;
      dayEndTime = new Date(currentDateStr + "T23:59:59.999");
    } else if (currentDateStr === endDateLocal) {
      dayStartTime = new Date(currentDateStr + "T00:00:00.000");
      dayEndTime = endDate;
    } else {
      dayStartTime = new Date(currentDateStr + "T00:00:00.000");
      dayEndTime = new Date(currentDateStr + "T23:59:59.999");
    }

    const dayDurationSeconds = Math.floor(
      (dayEndTime.getTime() - dayStartTime.getTime()) / 1000,
    );

    if (dayDurationSeconds > 0) {
      dailyTimeMap[currentDateStr] = dayDurationSeconds;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("Daily time distribution:", dailyTimeMap);

  const records = Object.entries(dailyTimeMap).map(([date, seconds]) => ({
    userId,
    date,
    total_seconds: seconds,
  }));

  if (records.length === 0) {
    return;
  }

  await db
    .insert(workTime)
    .values(records)
    .onConflictDoUpdate({
      target: [workTime.userId, workTime.date],
      set: {
        total_seconds: sql`work_time.total_seconds + excluded.total_seconds`,
      },
    });
}
