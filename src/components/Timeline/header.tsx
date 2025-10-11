"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useMobile } from "@/hooks/useMobile";

import {
  useTimelineData,
  useTimelineDate,
  useTimelineView,
} from "./context";
import { getDateRangeLabel } from "./utils";
import { View, Direction } from "./types";

export default function TimelineHeader() {
  const isMobile = useMobile();

  const { isFullHeight, isFullPage } = useTimelineView();

  return (
    <div className={isFullHeight || isFullPage ? "flex-shrink-0" : ""}>
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
    </div>
  );
}

function TimelineStats() {
  const isMobile = useMobile();
  const { statsData } = useTimelineData();

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
          {formatHours(statsData.total_hours)}
        </span>
        {!isMobile && (
          <span className="text-[var(--secondary)] text-xs">worked</span>
        )}
      </div>
    </div>
  );
}

function DateNavigation() {
  const { dateRange, view, handleNavigateTime } = useTimelineDate();
  const isMobile = useMobile();
  const rangeLabel = useMemo(
    () => getDateRangeLabel(dateRange, view),
    [view, dateRange],
  );

  return (
    <div className="flex items-center gap-2 flex-1 justify-end">
      <button
        onClick={() => handleNavigateTime(Direction.PREV)}
        className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        className={`text-sm font-medium text-center px-2 ${
          isMobile ? "flex-1 min-w-0 truncate" : "min-w-[200px]"
        }`}
      >
        {rangeLabel}
      </div>

      <button
        onClick={() => handleNavigateTime(Direction.NEXT)}
        className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ViewModeSelector() {
  const { view, setView } = useTimelineDate();
  const isMobile = useMobile();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`relative ${isMobile ? "flex-1" : ""}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center justify-between gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--active-task)] transition-colors min-w-[80px] ${
          isMobile ? "w-full" : ""
        }`}
      >
        <span className="capitalize">{view}</span>
        <ChevronDown size={16} />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-40 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[80px]">
            {Object.values(View).map((mode: View) => (
              <button
                key={mode}
                onClick={() => {
                  setView(mode);
                  setShowDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--active-task)] transition-colors capitalize ${
                  view === mode
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
  const { referenceDate, view } = useTimelineDate();
  const { isFullPage } = useTimelineView();
  const isMobile = useMobile();

  if (!isFullPage) {
    return (
      <Link
        href={`/activity/timeline?view=${view}&date=${referenceDate}`}
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
      href={`/activity?view=${view}&date=${referenceDate}`}
      className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
      title="Back to Activity"
    >
      <ArrowLeft size={16} />
      {!isMobile && <span>Back to Activity</span>}
    </Link>
  );
}
