"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";

import { useTimeline } from "./context";
import { formatLocalDate } from "./utils";

export default function TimelineHeader() {
  const { isMobile } = useTimeline();

  return (
    <div
      className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4 mb-6`}
    >
      {/* Stats + Date Navigation */}
      <div className="flex justify-between items-center gap-2 flex-1">
        <TimelineStats />
        <DateNavigation />
      </div>

      {/* Action Button + View Mode */}
      <div className="flex items-center gap-2">
        <ActionButton />
        <ViewModeSelector />
      </div>
    </div>
  );
}

function TimelineStats() {
  const { stats, isMobile } = useTimeline();

  const formatHours = (hours: number) => {
    if (hours === 0) return "0h";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  };

  return (
    <div className="inline-flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm flex-shrink-0">
      <Clock size={16} className="text-[var(--accent)] flex-shrink-0" />
      <div className="flex items-baseline gap-1">
        <span className="font-semibold text-[var(--foreground)]">
          {formatHours(stats.total_hours)}
        </span>
        {!isMobile && (
          <span className="text-[var(--secondary)] text-xs">worked</span>
        )}
      </div>
    </div>
  );
}

function DateNavigation() {
  const { dateRangeLabel, handleNavigateTime, isMobile } = useTimeline();

  return (
    <div className="flex items-center gap-2 flex-1 justify-end">
      <button
        onClick={() => handleNavigateTime("prev")}
        className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        className={`text-sm font-medium text-center px-2 ${
          isMobile ? "flex-1 min-w-0 truncate" : "min-w-[200px]"
        }`}
      >
        {dateRangeLabel}
      </div>

      <button
        onClick={() => handleNavigateTime("next")}
        className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ViewModeSelector() {
  const { viewMode, setViewMode, isMobile } = useTimeline();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`relative ${isMobile ? "flex-1" : ""}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center justify-between gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--active-task)] transition-colors min-w-[80px] ${
          isMobile ? "w-full" : ""
        }`}
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
                  setViewMode(mode);
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
  );
}

function ActionButton() {
  const { viewMode, currentDate, isFullPage, isMobile } = useTimeline();
  const currentDateString = formatLocalDate(currentDate);

  if (!isFullPage) {
    return (
      <Link
        href={`/activity/timeline?view=${viewMode}&date=${currentDateString}`}
        className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
        title="View in full screen"
      >
        <Maximize2 size={16} />
        {!isMobile && <span>Full View</span>}
      </Link>
    );
  }

  return (
    <Link
      href={`/activity?view=${viewMode}&date=${currentDateString}`}
      className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
      title="Back to Activity"
    >
      <ArrowLeft size={16} />
      {!isMobile && <span>Back to Activity</span>}
    </Link>
  );
}
