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
          totalDays={365}
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
              href={buildYearUrl(year)}
              className={`px-3 py-1.5 text-sm border transition-all rounded-[var(--border-radius)] ${
                selectedYear === year
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--active-task)]"
              }`}
            >
              {year}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
