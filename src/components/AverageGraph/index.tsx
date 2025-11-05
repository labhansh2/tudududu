import { Suspense } from "react";
import { DateRange, ViewMode } from "./types";
import {
  getHourlyActivityData,
  getHourlyActivityStats,
  getEarliestSessionDate,
} from "./actions";
import HourlyGraph from "./graph";
import Controls from "./controls";

interface HourlyActivityGraphProps {
  searchParams?: Record<string, string>;
}

export default async function HourlyActivityGraph({
  searchParams,
}: HourlyActivityGraphProps) {
  // Parse search params
  const dateRange = (searchParams?.range as DateRange) || DateRange.MONTH;
  const viewMode = (searchParams?.viewMode as ViewMode) || ViewMode.DAY;

  // Parse or set end date (default to now)
  const endDate = searchParams?.endDate
    ? new Date(searchParams.endDate)
    : new Date();

  // Calculate start date based on range
  const days = parseInt(dateRange);
  const startDate = new Date(
    endDate.getTime() - days * 24 * 60 * 60 * 1000,
  );

  // Fetch data
  const [hourlyData, stats, earliestDate] = await Promise.all([
    getHourlyActivityData(startDate, endDate, viewMode),
    getHourlyActivityStats(startDate, endDate, viewMode),
    getEarliestSessionDate(),
  ]);

  // Determine navigation state
  const now = new Date();
  const canGoForward = endDate < now;
  const canGoBack = earliestDate ? startDate > earliestDate : false;

  // Format date range for display
  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return currentYear === year
      ? `${month} ${day}`
      : `${month} ${day}, ${year}`;
  };

  const dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <div
      className="rounded-lg px-3 py-2 bg-[var(--card-bg)] h-full flex flex-col min-w-0 overflow-hidden"
      style={{
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header with controls and stats */}
      <div className="flex flex-col gap-1.5 mb-1.5">
        {/* Controls row */}
        <Suspense fallback={<div className="h-8" />}>
          <Controls
            currentDateRange={dateRange}
            currentViewMode={viewMode}
            currentEndDate={endDate.toISOString()}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
          />
        </Suspense>

        {/* Stats badges */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:flex-wrap min-w-0">
          {/* Date badge - full width on mobile, inline on desktop */}
          <div
            className="px-2 py-1 rounded text-xs bg-[var(--bg-lighter)] w-fit shrink-0"
            style={{ border: "1px solid var(--border)" }}
          >
            <span className="text-[var(--secondary)] whitespace-nowrap">
              {dateRangeText}
            </span>
          </div>

          {/* Stats row - wraps on small screens */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div
              className="px-2 py-1 rounded text-xs bg-[var(--bg-lighter)] shrink-0"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="text-[var(--foreground)] font-semibold whitespace-nowrap">
                {stats.peakLabel}
              </span>
              <span className="text-[var(--secondary)] ml-1 whitespace-nowrap">
                peak
              </span>
            </div>
            <div
              className="px-2 py-1 rounded text-xs bg-[var(--bg-lighter)] shrink-0"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="text-[var(--foreground)] font-semibold whitespace-nowrap">
                {stats.totalHours}h
              </span>
              <span className="text-[var(--secondary)] ml-1 whitespace-nowrap">
                total
              </span>
            </div>
            <div
              className="px-2 py-1 rounded text-xs bg-[var(--bg-lighter)] shrink-0"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="text-[var(--foreground)] font-semibold whitespace-nowrap">
                {viewMode === ViewMode.WEEK
                  ? `${stats.avgWeeklyHours}h`
                  : `${stats.avgDailyHours}h`}
              </span>
              <span className="text-[var(--secondary)] ml-1 whitespace-nowrap">
                {viewMode === ViewMode.WEEK ? "weekly" : "daily"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <HourlyGraph data={hourlyData} viewMode={viewMode} />
      </div>
    </div>
  );
}
