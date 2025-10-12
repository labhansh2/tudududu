import { cookies } from "next/headers";
import Link from "next/link";

import { customTheme, getDateRange } from "./utils";
import { getActivityData, getAvailableYears } from "./actions";

import ActivityMap from "./map";

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

  const years = await getAvailableYears().then((res) =>
    res.map((row) => row.year).sort((a, b) => b - a),
  );

  const activityData = await getActivityData(startDate, endDate);

  const totalSeconds = activityData.reduce(
    (sum, item) => sum + item.total_seconds,
    0,
  );
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  return (
    <>
      <ActivityMap activityData={activityData} customTheme={customTheme} />

      {/* Year Selection */}
      {years.length > 1 && (
        <YearSelection
          years={years}
          selectedYear={selectedYear}
          totalHours={totalHours}
          totalDays={Math.floor(
            (new Date(
              activityData[activityData.length - 1].date,
            ).getTime() -
              new Date(activityData[0].date).getTime()) /
              (1000 * 60 * 60 * 24),
          )}
          searchParams={searchParams}
        />
      )}
    </>
  );
}

interface YearSelectionProps {
  years: number[];
  selectedYear: number;
  totalHours: number;
  totalDays: number;
  searchParams?: Record<string, string>;
}

function YearSelection({
  years,
  selectedYear,
  totalHours,
  totalDays,
  searchParams,
}: YearSelectionProps) {
  const buildYearUrl = (year: number) => {
    const params = new URLSearchParams();

    params.set("year", year.toString());

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (key !== "year" && value) {
          params.set(key, value);
        }
      });
    }

    return `/activity?${params.toString()}`;
  };

  return (
    <div 
      className="mt-2 rounded-lg p-3 bg-[var(--card-bg)]"
      style={{ 
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {totalHours}h in last {totalDays} days
        </span>
        <div className="flex gap-1.5">
          {years.map((year) => (
            <Link
              key={year}
              href={buildYearUrl(year)}
              className={`px-3 py-1.5 text-sm font-semibold transition-all rounded-md ${
                selectedYear === year
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-lighter)] text-[var(--foreground)] hover:bg-[var(--bg-base)]"
              }`}
              style={selectedYear === year ? {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
              } : {}}
            >
              {year}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
