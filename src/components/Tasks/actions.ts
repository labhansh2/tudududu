"use server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { format, fromZonedTime, toZonedTime } from "date-fns-tz";

import { type Task, type Session } from "@/types";

import { db } from "@/drizzle";
import { sessions, tasks, workTime } from "@/drizzle/schema";

import { fillMissingDays } from "./utils";

export interface TaskStats {
  total_time_spent: number;
  longest_session: number;
  // think about what more stats can be added here
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
  deadline: Date | null;
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
      deadline: tasks.deadline,
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
      tasks.deadline,
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

  return tasksWithStats.map((task) => {
    const taskSparklineData = sparklineResults.filter(
      (s) => s.taskId === task.id,
    );
    const sparklineData = fillMissingDays(taskSparklineData, task.id);
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
      userId: task.userId,
      deadline: task.deadline,
      taskStats: {
        total_time_spent: task.total_time_spent,
        longest_session: task.longest_session,
      },
      sparklineData,
    };
  });
}

export async function createTask(
  name: string,
  deadlineInput?: string | null,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!name.trim()) {
    throw new Error("Task name is required");
  }

  try {
    let deadlineUTC: Date | null = null;

    if (deadlineInput && deadlineInput.trim() !== "") {
      const cookieStore = await cookies();
      const timezone = cookieStore.get("timezone")?.value;

      if (!timezone) {
        throw new Error("Timezone not found");
      }

      deadlineUTC = fromZonedTime(deadlineInput, timezone);

      const now = new Date();
      if (deadlineUTC <= now) {
        throw new Error("Deadline must be in the future");
      }
    }

    await db.insert(tasks).values({
      userId,
      name: name.trim(),
      status: "not_active",
      deadline: deadlineUTC,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add task:", error);
    throw new Error("Failed to add task");
  }
}

export async function setTaskDeadline(
  taskId: number,
  deadlineInput: string,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!deadlineInput || !deadlineInput.trim()) {
    throw new Error("Deadline is required");
  }

  try {
    const cookieStore = await cookies();
    const timezone = cookieStore.get("timezone")?.value;

    if (!timezone) {
      throw new Error("Timezone not found");
    }

    const deadlineUTC = fromZonedTime(deadlineInput, timezone);
    const now = new Date();
    if (deadlineUTC <= now) {
      throw new Error("Deadline must be in the future");
    }

    await db
      .update(tasks)
      .set({ deadline: deadlineUTC })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to set task deadline:", error);
    throw new Error("Failed to set task deadline");
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
          endedAt: new Date(), // already in utc
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

export async function addClosedSessionTime(closedActiveSession: Session) {
  console.log("CLOSED ACTIVE SESSION:", closedActiveSession);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    throw new Error("Timezone not found");
  }

  const userDateToday = format(
    toZonedTime(new Date(), timezone),
    "yyyy-MM-dd",
  );

  console.log("USER DATE TODAY:", userDateToday);

  const record: {
    userId: string;
    date: string;
    total_seconds: number;
  }[] = [];

  let startedAtUTC = closedActiveSession.startedAt;
  let startedAtDateUserTz = format(
    toZonedTime(startedAtUTC, timezone),
    "yyyy-MM-dd",
  );

  console.log("STARTED AT DATE USER TZ:", startedAtDateUserTz);
  console.log("STARTED AT UTC:", startedAtUTC);

  while (startedAtDateUserTz !== userDateToday) {
    const nextDayDateUserTz = new Date(startedAtDateUserTz + "T00:00:00");
    nextDayDateUserTz.setDate(nextDayDateUserTz.getDate() + 1);

    const nextDayMidnightUTC = fromZonedTime(nextDayDateUserTz, timezone);

    console.log("NEXT DAY MIDNIGHT UTC:", nextDayMidnightUTC);

    const differenceInSeconds = Math.floor(
      (nextDayMidnightUTC.getTime() - startedAtUTC.getTime()) / 1000,
    );

    record.push({
      userId,
      date: startedAtDateUserTz,
      total_seconds: differenceInSeconds,
    });

    startedAtDateUserTz = format(
      toZonedTime(nextDayMidnightUTC, timezone),
      "yyyy-MM-dd",
    );
    startedAtUTC = nextDayMidnightUTC;

    console.log("STARTED AT DATE USER TZ:", startedAtDateUserTz);
    console.log("STARTED AT UTC:", startedAtUTC);
  }

  console.log("STARTED AT DATE USER TZ:", startedAtDateUserTz);
  console.log("STARTED AT UTC:", startedAtUTC);

  const lastDifferenceInSeconds = Math.floor(
    (closedActiveSession.endedAt.getTime() - startedAtUTC.getTime()) /
      1000,
  );

  record.push({
    userId,
    date: startedAtDateUserTz,
    total_seconds: lastDifferenceInSeconds,
  });

  console.log("RECORD:", record);

  await db
    .insert(workTime)
    .values(record)
    .onConflictDoUpdate({
      target: [workTime.userId, workTime.date],
      set: {
        total_seconds: sql`${workTime.total_seconds} + excluded.total_seconds`,
      },
    });
}
