"use server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { format, toZonedTime } from "date-fns-tz";
import { lte, gte, eq, sql, and, asc } from "drizzle-orm";

import { db } from "@/drizzle";
import { workTime } from "@/drizzle/schema";

import { getLevel } from "./utils";

export async function getAvailableYears() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return db
    .selectDistinct({
      year: sql<number>`EXTRACT(YEAR FROM ${workTime.date})::integer`,
    })
    .from(workTime)
    .where(eq(workTime.userId, userId));
}

export async function getActivityData(startDate: string, endDate: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const data = await db
    .select({
      date: workTime.date,
      total_seconds: workTime.total_seconds,
    })
    .from(workTime)
    .where(
      and(
        eq(workTime.userId, userId),
        gte(workTime.date, startDate),
        lte(workTime.date, endDate),
      ),
    )
    .orderBy(asc(workTime.date));

  // this is sorta sloppy but it works
  // clean this up later if you want
  const bounds = [
    {
      date: startDate,
      total_seconds: 0,
      level: 0,
    },
    {
      date: endDate,
      total_seconds: 0,
      level: 0,
    },
  ];

  if (data.length === 0) {
    return bounds;
  }

  const res = [
    bounds[0],
    ...data.map((row) => ({
      date: row.date,
      total_seconds: row.total_seconds,
      level: getLevel(row.total_seconds),
    })),
    bounds[1],
  ];

  if (res[0].date === res[1].date) {
    res.shift();
  }

  if (res[res.length - 1].date === res[res.length - 2].date) {
    res.pop();
  }

  return res;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

// Deep work is defined as >3 hours (10800 seconds) per day
const DEEP_WORK_THRESHOLD = 10800; // 3 hours in seconds

export async function getStreakData(): Promise<StreakData> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    throw new Error("Timezone not found");
  }

  // Get all work time data ordered by date
  const allWorkTime = await db
    .select({
      date: workTime.date,
      total_seconds: workTime.total_seconds,
    })
    .from(workTime)
    .where(eq(workTime.userId, userId))
    .orderBy(asc(workTime.date));

  if (allWorkTime.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert to date strings and check for deep work days
  const deepWorkDays = new Set<string>();
  allWorkTime.forEach((entry) => {
    if (entry.total_seconds >= DEEP_WORK_THRESHOLD) {
      deepWorkDays.add(entry.date);
    }
  });

  // Calculate streaks
  const today = new Date();
  const todayStr = format(toZonedTime(today, timezone), "yyyy-MM-dd");

  // Calculate current streak (going backwards from today)
  // If today has deep work, count backwards until we find a gap
  // If today doesn't have deep work, the streak is 0
  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check if today has deep work first
  const todayHasDeepWork = deepWorkDays.has(todayStr);

  if (todayHasDeepWork) {
    // Count backwards from today
    while (true) {
      const dateStr = format(
        toZonedTime(checkDate, timezone),
        "yyyy-MM-dd",
      );

      if (deepWorkDays.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Found a gap, streak ends
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  // Get sorted list of all dates that had deep work
  const sortedDates = Array.from(deepWorkDays).sort();

  if (sortedDates.length > 0) {
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr + "T00:00:00");

      if (prevDate === null) {
        tempStreak = 1;
        longestStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          // Streak broken
          tempStreak = 1;
        }
      }

      prevDate = currentDate;
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
