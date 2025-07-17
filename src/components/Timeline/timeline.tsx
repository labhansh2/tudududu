"use client";

import { useTimeline } from "./context";

import TimelineHeader from "./header";
import TimelineGrid from "./grid";
import SessionTooltip from "./session-tooltip";

export default function SessionTimeline() {
  const { isFullHeight, isFullPage } = useTimeline();

  return (
    <div
      className={`w-full bg-[var(--card-bg)] text-[var(--foreground)] ${
        isFullPage
          ? "h-full flex flex-col p-4"
          : `p-4 sm:p-6 rounded-lg border border-[var(--border)] ${isFullHeight ? "h-full flex flex-col" : ""}`
      }`}
    >
      <div className={isFullHeight || isFullPage ? "flex-shrink-0" : ""}>
        <TimelineHeader />
      </div>

      <div className={isFullHeight || isFullPage ? "flex-1 min-h-0" : ""}>
        <TimelineGrid />
      </div>

      <SessionTooltip />
    </div>
  );
}
