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
import { TimelineStats } from "./actions";
import { formatLocalDate } from "./utils";

interface TimelineHeaderProps {
  viewMode: "day" | "week" | "month";
  dateRangeLabel: string;
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  onNavigate: (direction: "next" | "prev") => void;
  isFullPage?: boolean;
  currentDate?: string;
  stats: TimelineStats;
  isMobile?: boolean;
}

export default function TimelineHeader({
  viewMode,
  dateRangeLabel,
  onViewModeChange,
  onNavigate,
  isFullPage = true,
  currentDate,
  stats,
  isMobile = false,
}: TimelineHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatHours = (hours: number) => {
    if (hours === 0) return "0h";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-6`}>
      {/* Div A: Stats + Date Navigation */}
      <div className="flex justify-between items-center gap-2 flex-1">
        {/* Stats Section */}
        <div className="inline-flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm flex-shrink-0">
          <Clock size={16} className="text-[var(--accent)] flex-shrink-0" />
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-[var(--foreground)]">
              {formatHours(stats.total_hours)}
            </span>
            {!isMobile && (
              <span className="text-[var(--secondary)] text-xs">
                worked
              </span>
            )}
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => onNavigate("prev")}
            className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            className={`text-sm font-medium text-center px-2 ${isMobile ? "flex-1 min-w-0 truncate" : "min-w-[200px]"}`}
          >
            {dateRangeLabel}
          </div>

          <button
            onClick={() => onNavigate("next")}
            className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Div B: Full Screen + View Mode */}
      <div className="flex items-center gap-2">
        {/* Full View / Back Button */}
        {!isFullPage ? (
          <Link
            href={`/activity/timeline?view=${viewMode}&date=${currentDate ? formatLocalDate(new Date(currentDate)) : formatLocalDate(new Date())}`}
            className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
            title="View in full screen"
          >
            <Maximize2 size={16} />
            {!isMobile && <span>Full View</span>}
          </Link>
        ) : (
          <Link
            href={`/activity?view=${viewMode}&date=${currentDate ? formatLocalDate(new Date(currentDate)) : formatLocalDate(new Date())}`}
            className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:bg-[var(--active-task)] transition-colors"
            title="Back to Activity"
          >
            <ArrowLeft size={16} />
            {!isMobile && <span>Back to Activity</span>}
          </Link>
        )}

        {/* View Mode Dropdown */}
        <div className={`relative ${isMobile ? "flex-1" : ""}`}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center justify-between gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--active-task)] transition-colors min-w-[80px] ${isMobile ? "w-full" : ""}`}
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
  );
}
