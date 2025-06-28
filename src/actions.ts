"use server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc, isNull, gte, lt, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle";
import { sessions, tasks, workTime } from "@/drizzle/schema";
import { Task } from "./types";
import { splitDurationByDay } from "./utils";

export async function addTask(name: string) {
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

export async function editTask(taskId: number, newName: string) {
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
        name: newName.trim(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit task:", error);
    throw new Error("Failed to edit task");
  }
}

export async function deleteTask(task: Task, timezone: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    if (task.status === "active") {
      await db
        .update(sessions)
        .set({
          endedAt: new Date(),
        })
        .where(eq(sessions.taskId, task.id));

      await updateWorkTime(task.id, new Date(), timezone);
    }

    await db.delete(sessions).where(eq(sessions.taskId, task.id));

    await db
      .delete(tasks)
      .where(and(eq(tasks.id, task.id), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
}

export async function toggleWorkingStatus(
  taskId: number,
  activeTask: Task | undefined,
  timezone: string,
) {
  try {
    const now = new Date();

    if (activeTask && activeTask.id === taskId) {
      // deactivate task
      // end the task session

      await Promise.all([
        db
          .update(tasks)
          .set({
            status: "not_active",
          })
          .where(eq(tasks.id, taskId)),
        db
          .update(sessions)
          .set({
            endedAt: now,
          })
          .where(eq(sessions.taskId, taskId)),
        updateWorkTime(taskId, now, timezone),
      ]);
    } else if (activeTask && activeTask.id !== taskId) {
      // end session for the active task
      // deactivate the active task
      // activate the task
      // start a new session for task

      await Promise.all([
        db
          .update(sessions)
          .set({
            endedAt: now,
          })
          .where(eq(sessions.taskId, activeTask.id)),
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
          startedAt: now,
        }),
        updateWorkTime(activeTask.id, now, timezone),
      ]);
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
          startedAt: now,
        }),
      ]);

      // await updateWorkHours(taskId, now, timezone);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle working status:", error);
    throw new Error("Failed to toggle working status");
  }
}

export async function completeTask(task: Task, timezone: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    if (task.status === "active") {
      await db
        .update(sessions)
        .set({
          endedAt: new Date(),
        })
        .where(eq(sessions.taskId, task.id));
      await updateWorkTime(task.id, new Date(), timezone);
    }

    await db
      .update(tasks)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, task.id), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete task:", error);
    throw new Error("Failed to complete task");
  }
}

export async function getTasks(userId: string, searchQuery?: string) {
  try {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(
      // Completed tasks go to bottom, then by updatedAt desc
      desc(tasks.status),
      desc(tasks.updatedAt),
    );

    const allTasks = await query;

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const filtered = allTasks.filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return filtered;
    }

    return allTasks;
  } catch (error) {
    console.error("Failed to get tasks:", error);
    return [];
  }
}

export async function updateWorkTime(
  taskId: number,
  endedAt: Date,
  timezone: string,
) {
  // get the most recent session for the task
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.taskId, taskId),
    orderBy: [desc(sessions.startedAt)],
  });

  if (!session?.startedAt) return;

  // get the task for user id
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) return;

  // split time by user-local date
  const timeMap = splitDurationByDay(
    session.startedAt.toISOString(),
    endedAt.toISOString(),
    timezone,
  );

  // update workTime table
  for (const [dateStr, seconds] of timeMap.entries()) {
    const date = new Date(`${dateStr}T00:00:00Z`); // storing as UTC midnight

    const existing = await db.query.workTime.findFirst({
      where: and(eq(workTime.userId, task.userId), eq(workTime.date, date)),
    });

    if (existing) {
      await db
        .update(workTime)
        .set({ total_seconds: existing.total_seconds + Math.round(seconds) })
        .where(eq(workTime.id, existing.id));
    } else {
      await db.insert(workTime).values({
        userId: task.userId,
        date,
        total_seconds: Math.round(seconds),
      });
    }
  }
}
