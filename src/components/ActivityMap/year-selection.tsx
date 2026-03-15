"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface YearSelectionProps {
  years: number[];
  selectedYear: number;
  totalHours: number;
  totalDays: number;
  streakData: { currentStreak: number; longestStreak: number };
  searchParams?: Record<string, string>;
}

export default function YearSelection({
  years,
  selectedYear,
  totalHours,
  totalDays,
  streakData,
  searchParams,
}: YearSelectionProps) {
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Format hours nicely
  const formatHours = (hours: number) => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    if (hours >= 100) {
      return hours.toFixed(0);
    }
    return hours.toFixed(1);
  };

  const hasMultipleYears = years.length > 1;

  return (
    <div
      className="rounded-b-lg rounded-t-none px-4 py-2.5 bg-(--card-bg) flex-shrink-0"
      style={{
        // Seamless merge with map card above - no border, no shadow
        boxShadow: "none",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Hours and streak inline */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-foreground">
                {formatHours(totalHours)}h
              </span>
              <span className="text-xs text-(--secondary)">
                total
              </span>
            </div>
            <span className="text-xs text-(--secondary)">.</span>
            <span className="text-xs text-(--secondary)">
              <span className="text-(--accent) font-semibold">
                {streakData.currentStreak}
              </span>{" "}
              days 3h+
            </span>
            {streakData.longestStreak > streakData.currentStreak && (
              <>
                <span className="text-xs text-(--secondary)">·</span>
                <span className="text-xs text-(--secondary)">
                  best {streakData.longestStreak}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side: Year selector - only show if multiple years */}
        {hasMultipleYears && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between gap-2 bg-(--bg-lightest) rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-(--bg-base) transition-all min-w-[80px]"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <span>{selectedYear}</span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDropdown(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 z-40 bg-(--bg-lightest) rounded-lg py-1.5 min-w-[100px]"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  {years.map((year) => (
                    <Link
                      key={year}
                      href={buildYearUrl(year)}
                      onClick={() => setShowDropdown(false)}
                      className={`block w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-(--bg-lighter) transition-colors ${
                        selectedYear === year
                          ? "text-(--accent) bg-(--bg-lighter)"
                          : "text-foreground"
                      }`}
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
