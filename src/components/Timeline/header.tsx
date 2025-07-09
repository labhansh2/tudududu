import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface TimelineHeaderProps {
  viewMode: "day" | "week" | "month";
  dateRangeLabel: string;
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  onNavigate: (direction: "next" | "prev") => void;
  isFullHeight?: boolean;
  isFullPage?: boolean;
  currentDate?: string;
}

export function TimelineHeader({
  viewMode,
  dateRangeLabel,
  onViewModeChange,
  onNavigate,
  isFullHeight = false,
  isFullPage = true,
  currentDate,
}: TimelineHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        {/* <h3 className="text-lg font-medium mb-1">Session Timeline</h3> */}
        {/* <p className="text-sm text-[var(--secondary)]">
          worked 47 hrs • average 7 hrs per day
        </p> */}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Navigation */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate("prev")}
            className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-sm font-medium flex-1 sm:flex-initial min-w-[140px] sm:min-w-[200px] text-center px-2">
            {dateRangeLabel}
          </div>

          <button
            onClick={() => onNavigate("next")}
            className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Full View / Back Button + View Mode Dropdown - side by side on mobile */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Full View / Back Button */}
          {!isFullPage ? (
            <Link
              href={`/activity/timeline?view=${viewMode}&date=${currentDate || new Date().toISOString().split("T")[0]}`}
              className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
              title="View in full screen"
            >
              <Maximize2 size={16} />
              <span className="hidden sm:inline">Full View</span>
            </Link>
          ) : (
            <Link
              href="/activity"
              className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
              title="Back to Activity"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Activity</span>
            </Link>
          )}

          {/* View Mode Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--active-task)] transition-colors w-full sm:w-auto min-w-[80px]"
            >
              <span className="capitalize">{viewMode}</span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-40 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[80px]">
                  {(["day", "week", "month"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onViewModeChange(mode);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--active-task)] transition-colors capitalize ${
                        viewMode === mode
                          ? "text-[var(--accent)] bg-[var(--active-task)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
