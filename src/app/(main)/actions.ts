"use server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/schema";

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

export async function deleteTask(taskId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
}

export async function toggleWorkingStatus(taskId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // First, get the current task
    const currentTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (currentTask.length === 0) {
      throw new Error("Task not found");
    }

    const task = currentTask[0];

    if (task.status === "completed") {
      throw new Error("Cannot modify completed task");
    }

    if (task.status === "active") {
      // Deactivate this task
      await db
        .update(tasks)
        .set({
          status: "not_active",
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    } else {
      // First, deactivate all other tasks for this user
      await db
        .update(tasks)
        .set({ status: "not_active" })
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "active")));

      // Then activate this task
      await db
        .update(tasks)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle working status:", error);
    throw new Error("Failed to toggle working status");
  }
}

export async function completeTask(taskId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await db
      .update(tasks)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

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
