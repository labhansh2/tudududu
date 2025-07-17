"use server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { fromZonedTime } from "date-fns-tz";

import { db } from "@/drizzle";
import { sessions, tasks, workTime } from "@/drizzle/schema";
import { eq, and, gte, lte, asc, or, gt, sql, lt, ne } from "drizzle-orm";

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

  const startDateUTC = fromZonedTime(startDate, timezone!);
  const endDateUTC = fromZonedTime(endDate, timezone!);

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
    .innerJoin(
      tasks,
      and(eq(sessions.taskId, tasks.id), eq(sessions.userId, userId)),
    )
    .where(
      or(
        and(
          gte(sessions.startedAt, startDateUTC),
          lt(sessions.startedAt, endDateUTC),
        ),
        and(
          gte(sessions.endedAt, startDateUTC),
          lt(sessions.endedAt, endDateUTC),
        ),
        and(
          lt(sessions.startedAt, startDateUTC),
          gt(sessions.endedAt, endDateUTC),
        ),
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

export interface TimelineStats {
  total_hours: number;
}

export async function getTimelineStats(
  startDate: Date,
  endDate: Date,
): Promise<TimelineStats> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const data = await db
    .select({
      total_seconds: sql<number>`SUM(total_seconds)`,
    })
    .from(workTime)
    .where(
      and(
        eq(workTime.userId, userId),
        gte(workTime.date, startDate.toISOString()),
        lte(workTime.date, endDate.toISOString()),
      ),
    );

  return {
    total_hours: Math.round((data[0].total_seconds / 3600) * 10) / 10,
  };
}
