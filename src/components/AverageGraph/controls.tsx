"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange, ViewMode } from "./types";

interface ControlsProps {
  currentDateRange: DateRange;
  currentViewMode: ViewMode;
  currentEndDate: string; // ISO string
  canGoBack: boolean;
  canGoForward: boolean;
}

export default function Controls({
  currentDateRange,
  currentViewMode,
  currentEndDate,
  canGoBack,
  canGoForward,
}: ControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`?${params.toString()}`);
  };

  const navigate = (direction: "back" | "forward") => {
    const endDate = new Date(currentEndDate);
    const days = parseInt(currentDateRange);
    const offset = direction === "back" ? -days : days;
    const newEndDate = new Date(
      endDate.getTime() + offset * 24 * 60 * 60 * 1000,
    );

    updateParams({ endDate: newEndDate.toISOString() });
  };

  const dateRangeOptions = [
    { value: DateRange.WEEK, label: "7d" },
    { value: DateRange.MONTH, label: "30d" },
    { value: DateRange.QUARTER, label: "90d" },
    { value: DateRange.YEAR, label: "1y" },
  ];

  const viewModeOptions = [
    { value: ViewMode.DAY, label: "Day" },
    { value: ViewMode.WEEK, label: "Week" },
  ];

  return (
    <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
      {/* Left: Navigation and Range */}
      <div className="flex items-center gap-1.5 flex-shrink min-w-0">
        {/* Navigation Arrows */}
        <div
          className="flex rounded-md overflow-hidden flex-shrink-0"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <button
            onClick={() => navigate("back")}
            disabled={!canGoBack}
            className={`p-1.5 transition-all ${
              canGoBack
                ? "bg-[var(--bg-lightest)] hover:bg-[var(--bg-base)] text-[var(--foreground)]"
                : "bg-[var(--bg-lighter)] text-[var(--secondary)] opacity-50 cursor-not-allowed"
            }`}
            title="Previous period"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="w-px bg-[var(--border)]" />
          <button
            onClick={() => navigate("forward")}
            disabled={!canGoForward}
            className={`p-1.5 transition-all ${
              canGoForward
                ? "bg-[var(--bg-lightest)] hover:bg-[var(--bg-base)] text-[var(--foreground)]"
                : "bg-[var(--bg-lighter)] text-[var(--secondary)] opacity-50 cursor-not-allowed"
            }`}
            title="Next period"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Date Range Selector */}
        <div
          className="flex rounded-md overflow-hidden flex-shrink-0"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {dateRangeOptions.map((option, index) => (
            <div key={option.value} className="flex">
              {index > 0 && <div className="w-px bg-[var(--border)]" />}
              <button
                onClick={() =>
                  updateParams({
                    range: option.value,
                    endDate: new Date().toISOString(),
                  })
                }
                className={`px-2 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  currentDateRange === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-lightest)] text-[var(--foreground)] hover:bg-[var(--bg-base)]"
                }`}
              >
                {option.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: View Mode Selector */}
      <div
        className="flex rounded-md overflow-hidden flex-shrink-0"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {viewModeOptions.map((option, index) => (
          <div key={option.value} className="flex">
            {index > 0 && <div className="w-px bg-[var(--border)]" />}
            <button
              onClick={() => updateParams({ viewMode: option.value })}
              className={`px-2 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                currentViewMode === option.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-lightest)] text-[var(--foreground)] hover:bg-[var(--bg-base)]"
              }`}
            >
              {option.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
