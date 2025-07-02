import { ActivityCalendar } from "react-activity-calendar";
import { db } from "@/drizzle";
import { workTime } from "@/drizzle/schema";
import { eq, gte, sql, and, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { customTheme, convertToActivityData } from "@/utils";
import ActivityCalendarContainer from "@/components/ActivityCalendarContainer";

export default async function Activity({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center text-[var(--foreground)]">
          Please sign in to view your activity
        </div>
      </div>
    );
  }

  // Get selected year from URL or default to current year
  const currentYear = new Date().getFullYear();
  const params = await searchParams;
  const selectedYear = params.year ? parseInt(params.year) : currentYear;

  // Get available years for year selection
  const availableYears = await db
    .selectDistinct({
      year: sql<number>`EXTRACT(YEAR FROM ${workTime.date})::integer`,
    })
    .from(workTime)
    .where(eq(workTime.userId, userId));

  const years = availableYears.map((row) => row.year).sort((a, b) => b - a);

  // Determine date range based on selected year
  let startDate: Date, endDate: Date;
  if (selectedYear === currentYear) {
    // For current year, get past 365 days ending today
    endDate = new Date();
    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
  } else {
    // For past years, get data for that specific year plus some context
    endDate = new Date(selectedYear, 11, 31);
    startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364); // Still show 365 days ending at Dec 31
  }

  // Fetch work time data for the selected period
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
    );

  const activityData = convertToActivityData(data, startDate, endDate);
  const totalSeconds = data.reduce((sum, item) => sum + item.total_seconds, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const totalDays = activityData.length;
  const avgHoursPerDay = totalHours / totalDays;

  return (
    <div className="mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-4">

        <ActivityCalendarContainer
          activityData={activityData}
          customTheme={customTheme}
        />

        {/* Year Selection */}
        {years.length > 1 && (
          <div className="mt-2 border border-[var(--input-border)] rounded-[var(--border-radius)] shadow-sm p-2.5 bg-[var(--card-bg)]">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium text-[var(--foreground)]"
                style={{ marginLeft: 8 }}
              >
                {totalHours}h in last {totalDays} days
              </span>
              <div className="flex gap-1 ">
                {years.map((year) => (
                  <Link
                    key={year}
                    href={`/activity?year=${year}`}
                    className={`px-3 py-1.5 text-sm border transition-all rounded-[var(--border-radius)] ${
                      selectedYear === year
                        ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                        : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--active-task)]"
                    }`}
                    // style={{ marginLeft: 4, marginRight: 4 }}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
