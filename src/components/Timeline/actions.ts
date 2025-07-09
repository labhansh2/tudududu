"use server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { db } from "@/drizzle";
import { sessions, tasks } from "@/drizzle/schema";
import { eq, and, gte, lte, asc, or, isNull } from "drizzle-orm";

export interface TimelineSession {
  sessionId: string;
  taskId: string;
  taskName: string;
  taskStatus: "completed" | "active" | "not_active";
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date | null;
}

export async function getTimelineSessions(
  startDate: Date,
  endDate: Date,
): Promise<TimelineSession[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  const data = await db
    .select({
      sessionId: sessions.sessionId,
      taskId: sessions.taskId,
      taskName: tasks.name,
      taskStatus: tasks.status,
      taskUpdatedAt: tasks.updatedAt,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .innerJoin(tasks, eq(sessions.taskId, tasks.id))
    .where(
      and(
        eq(sessions.userId, userId),
        lte(sessions.startedAt, endDate),
        or(gte(sessions.endedAt, startDate), isNull(sessions.endedAt)),
      ),
    )
    .orderBy(asc(sessions.startedAt));

  return data.map((row) => ({
    sessionId: row.sessionId.toString(),
    taskId: row.taskId.toString(),
    taskName: row.taskName,
    taskStatus: row.taskStatus,
    updatedAt: row.taskUpdatedAt,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
  }));
}
