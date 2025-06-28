import { DateTime } from "luxon";

import { Activity, WorkTimeData } from "@/types";

// Custom theme for activity calendar
export const customTheme = {
  light: [
    "#f3f4f6", // Level 0 - Light gray (similar to --completed-task)
    "#e5f9f3", // Level 1 - Extra light green
    "#d1fae5", // Level 2 - Very light green
    "#a7f3d0", // Level 3 - Light green
    "#6ee7b7", // Level 4 - Medium green
    "#34d399", // Level 5 - Slightly deeper green
    "#10b981", // Level 6 - App accent color (--success)
    "#059669", // Level 7 - Deep accent green
  ],
  dark: [
    "#262626", // Level 0 - Dark gray (similar to --completed-task dark)
    "#1b2a24", // Level 1 - Extra dark green
    "#064e3b", // Level 2 - Very dark green (similar to --active-task dark)
    "#065f46", // Level 3 - Dark green
    "#047857", // Level 4 - Medium dark green
    "#059669", // Level 5 - App accent color dark (--accent)
    "#10b981", // Level 6 - Lighter accent green
    "#34d399", // Level 7 - Bright green
  ],
};

function getLevel(totalSeconds: number) {
  if (totalSeconds >= 46800) return 7; // 13+ hours
  if (totalSeconds >= 39600) return 6; // 11+ hours
  if (totalSeconds >= 32400) return 5; // 9+ hour
  if (totalSeconds >= 25200) return 4; // 7+ hours
  if (totalSeconds >= 18000) return 3; // 5+ hours
  if (totalSeconds >= 10800) return 2; // 3+ hours
  if (totalSeconds >= 3600) return 1; // 1+ hours
  return 0;
}

// Generate dates for the selected period
function generateDates(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

// Convert database data to Activity format
export function convertToActivityData(data: WorkTimeData[], startDate: Date, endDate: Date): Activity[] {
  const dates = generateDates(startDate, endDate);
  const dataMap = new Map<string, number>();

  // Create a map of date -> total_seconds from database data
  data.forEach((item) => {
    const dateStr = new Date(item.date).toISOString().split("T")[0];
    dataMap.set(dateStr, item.total_seconds);
  });

  // Generate activity data for all dates
  return dates.map((date) => {
    const totalSeconds = dataMap.get(date) || 0;
    return {
      date,
      count: totalSeconds,
      level: getLevel(totalSeconds),
    };
  });
}


/**
 * Splits the duration between two ISO timestamps across the days they span,
 * returning a map of `yyyy-MM-dd` (in user timezone) to number of seconds worked on that day.
 */
export function splitDurationByDay(
  startISO: string,
  endISO: string,
  timezone: string,
): Map<string, number> {
  const start = DateTime.fromISO(startISO, { zone: timezone });
  const end = DateTime.fromISO(endISO, { zone: timezone });

  const secondsPerDay = new Map<string, number>();

  if (!start.isValid || !end.isValid || end <= start) return secondsPerDay;

  let cursor = start;

  while (cursor < end) {
    const endOfDay = cursor.endOf("day");
    const segmentEnd = end < endOfDay ? end : endOfDay;

    const diffInSeconds = segmentEnd.diff(cursor, "seconds").seconds;
    const dayKey = cursor.toFormat("yyyy-MM-dd");

    secondsPerDay.set(
      dayKey,
      (secondsPerDay.get(dayKey) || 0) + Math.round(diffInSeconds),
    );

    cursor = segmentEnd;
  }
  console.log("secondsPerDay", secondsPerDay.size);
  for (const [day, seconds] of secondsPerDay.entries()) {
    console.log(`${day}: ${seconds} seconds`);
  }
  return secondsPerDay;
}


