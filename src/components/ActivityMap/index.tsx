import { cookies } from "next/headers";

import { customTheme, getDateRange } from "./utils";
import {
  getActivityData,
  getAvailableYears,
  getStreakData,
} from "./actions";

import ActivityMap from "./map";
import YearSelection from "./year-selection";

export default async function Activity({
  selectedYear,
  currentYear,
  searchParams,
}: {
  selectedYear: number;
  currentYear: number;
  searchParams?: Record<string, string>;
}) {
  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  const { startDate, endDate } = getDateRange(
    selectedYear,
    currentYear,
    timezone || "America/Toronto",
  );

  const [years, activityData, streakData] = await Promise.all([
    getAvailableYears().then((res) =>
      res.map((row) => row.year).sort((a, b) => b - a),
    ),
    getActivityData(startDate, endDate),
    getStreakData(),
  ]);

  const totalSeconds = activityData.reduce(
    (sum, item) => sum + item.total_seconds,
    0,
  );
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  return (
    <div className="flex flex-col h-full">
      <ActivityMap activityData={activityData} customTheme={customTheme} />

      {/* Year Selection - always shown, merged with map card */}
      <YearSelection
        years={years}
        selectedYear={selectedYear}
        totalHours={totalHours}
        totalDays={Math.floor(
          (new Date(activityData[activityData.length - 1].date).getTime() -
            new Date(activityData[0].date).getTime()) /
            (1000 * 60 * 60 * 24),
        )}
        streakData={streakData}
        searchParams={searchParams}
      />
    </div>
  );
}
