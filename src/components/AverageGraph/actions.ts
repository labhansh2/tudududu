"use server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { toZonedTime } from "date-fns-tz";
import { eq, and, gte, sql, asc } from "drizzle-orm";

import { db } from "@/drizzle";
import { sessions } from "@/drizzle/schema";

import { HourlyData, DateRange, ViewMode } from "./types";

export async function getHourlyActivityData(
  startDate: Date,
  endDate: Date,
  viewMode: ViewMode = ViewMode.DAY,
): Promise<HourlyData[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value || "America/Toronto";

  const daysInRange = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (viewMode === ViewMode.WEEK) {
    // For week mode, group by day of week (0 = Sunday, 6 = Saturday)
    const data = await db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})::integer`,
        totalMinutes: sql<number>`SUM(
          CASE 
            WHEN ${sessions.endedAt} IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt})) / 60
            ELSE 0
          END
        )`,
        sessionCount: sql<number>`COUNT(*)`,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          gte(sessions.startedAt, startDate),
          sql`${sessions.endedAt} IS NOT NULL`,
        ),
      )
      .groupBy(sql`EXTRACT(DOW FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})`)
      .orderBy(sql`EXTRACT(DOW FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})`);

    // Create an array for all 7 days (0 = Sunday to 6 = Saturday)
    const weekData: HourlyData[] = Array.from({ length: 7 }, (_, day) => ({
      hour: day, // Using hour field to store day of week for consistency
      avgMinutes: 0,
      totalSessions: 0,
    }));

    // Calculate number of weeks
    const weeks = daysInRange / 7;

    // Fill in the actual data
    data.forEach((row) => {
      const dayOfWeek = row.dayOfWeek;
      const totalMinutes = row.totalMinutes || 0;

      // Average per week
      const avgMinutes = totalMinutes / weeks;

      weekData[dayOfWeek] = {
        hour: dayOfWeek,
        avgMinutes: Math.round(avgMinutes * 10) / 10,
        totalSessions: row.sessionCount || 0,
      };
    });

    return weekData;
  } else {
    // For day mode, group by hour of day
    const data = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})::integer`,
        totalMinutes: sql<number>`SUM(
          CASE 
            WHEN ${sessions.endedAt} IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt})) / 60
            ELSE 0
          END
        )`,
        sessionCount: sql<number>`COUNT(*)`,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          gte(sessions.startedAt, startDate),
          sql`${sessions.endedAt} IS NOT NULL`,
        ),
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${sessions.startedAt} AT TIME ZONE ${sql.raw(`'${timezone}'`)})`);

    // Create an array for all 24 hours
    const hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      avgMinutes: 0,
      totalSessions: 0,
    }));

    // Fill in the actual data
    data.forEach((row) => {
      const hour = row.hour;
      const totalMinutes = row.totalMinutes || 0;

      // Average per day (divide by total days in range)
      const avgMinutes = totalMinutes / daysInRange;

      hourlyData[hour] = {
        hour,
        avgMinutes: Math.round(avgMinutes * 10) / 10,
        totalSessions: row.sessionCount || 0,
      };
    });

    return hourlyData;
  }
}

export async function getHourlyActivityStats(
  startDate: Date,
  endDate: Date,
  viewMode: ViewMode = ViewMode.DAY,
): Promise<{
  totalHours: number;
  peakValue: number;
  peakLabel: string;
  avgDailyHours: number;
  avgWeeklyHours: number;
}> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const daysInRange = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const data = await db
    .select({
      totalSeconds: sql<number>`SUM(
        CASE 
          WHEN ${sessions.endedAt} IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (${sessions.endedAt} - ${sessions.startedAt}))
          ELSE 0
        END
      )`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.startedAt, startDate),
        sql`${sessions.startedAt} < ${endDate}`,
        sql`${sessions.endedAt} IS NOT NULL`,
      ),
    );

  const totalHours = Math.round(((data[0]?.totalSeconds || 0) / 3600) * 10) / 10;
  const avgDailyHours = Math.round((totalHours / daysInRange) * 10) / 10;
  const avgWeeklyHours = Math.round((totalHours / (daysInRange / 7)) * 10) / 10;

  // Get peak hour/day based on view mode
  const activityData = await getHourlyActivityData(startDate, endDate, viewMode);
  const peak = activityData.reduce(
    (peak, curr) => (curr.avgMinutes > peak.avgMinutes ? curr : peak),
    activityData[0],
  );

  let peakLabel: string;
  if (viewMode === ViewMode.WEEK) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    peakLabel = days[peak.hour] || "";
  } else {
    if (peak.hour === 0) peakLabel = "12am";
    else if (peak.hour === 12) peakLabel = "12pm";
    else if (peak.hour < 12) peakLabel = `${peak.hour}am`;
    else peakLabel = `${peak.hour - 12}pm`;
  }

  return {
    totalHours,
    peakValue: peak.hour,
    peakLabel,
    avgDailyHours,
    avgWeeklyHours,
  };
}

export async function getEarliestSessionDate(): Promise<Date | null> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const result = await db
    .select({
      startedAt: sessions.startedAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(asc(sessions.startedAt))
    .limit(1);

  return result.length > 0 ? result[0].startedAt : null;
}

