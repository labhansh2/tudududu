import { DateTime } from "luxon";

/**
 * Splits the duration between two ISO timestamps across the days they span,
 * returning a map of `yyyy-MM-dd` (in user timezone) to number of seconds worked on that day.
 */
export function splitDurationByDay(
  startISO: string,
  endISO: string,
  timezone: string
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
      (secondsPerDay.get(dayKey) || 0) + Math.round(diffInSeconds)
    );

    cursor = segmentEnd;
  }
  console.log("secondsPerDay", secondsPerDay.size);
  for (const [day, seconds] of secondsPerDay.entries()) {
    console.log(`${day}: ${seconds} seconds`);
  }
  return secondsPerDay;
}
