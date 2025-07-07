"use server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/drizzle";
import { sessions, tasks, workTime } from "@/drizzle/schema";
import { Task, Session } from "../../types";

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

// there is a bug here
export async function toggleTaskStatus(
  taskId: number,
  activeTask: Task | undefined,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

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
