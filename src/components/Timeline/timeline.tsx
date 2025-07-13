"use client";
import { useMemo, useEffect, useState } from "react";

import { useMobile } from "@/hooks/useMobile";

import { TimelineSession as Session, TimelineStats } from "./actions";
import {
  getTimeRange,
  getDateRangeLabel,
  groupSessionsByTask,
} from "./utils";
import { useURLSync, useSessionInteraction } from "./hooks";

import TimelineHeader from "./header";
import TimelineGrid from "./grid";
import SessionTooltip from "./session-tooltip";

// Main Component
export default function SessionTimeline({
  sessionsData,
  stats,
  initialViewMode = "week",
  initialCurrentDate,
  isFullHeight = false,
  isFullPage = true,
}: {
  sessionsData: Session[];
  stats: TimelineStats;
  initialViewMode?: "day" | "week" | "month";
  initialCurrentDate?: string;
  isFullHeight?: boolean;
  isFullPage?: boolean;
}) {
  // Custom hooks for state management
  const isMobile = useMobile();
  const {
    viewMode,
    currentDate,
    handleViewModeChange,
    handleNavigateTime,
  } = useURLSync(initialViewMode, initialCurrentDate);
  const {
    hoveredSession,
    hoveredPosition,
    clickedSession,
    handleSessionHover,
    handleSessionLeave,
    handleSessionClick,
  } = useSessionInteraction(isMobile);

  // Memoized calculations
  const timeRange = useMemo(
    () => getTimeRange(currentDate, viewMode),
    [currentDate, viewMode],
  );

  const dateRangeLabel = useMemo(
    () => getDateRangeLabel(currentDate, viewMode),
    [currentDate, viewMode],
  );

  const filteredSessions = useMemo(() => {
    return sessionsData.filter((session) => {
      const sessionEnd = session.endedAt || new Date();
      return (
        session.startedAt < timeRange.end && sessionEnd > timeRange.start
      );
    });
  }, [sessionsData, timeRange]);

  const taskGroups = useMemo(() => {
    return groupSessionsByTask(filteredSessions);
  }, [filteredSessions]);

  // Real-time updates for active sessions
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure consistent server/client rendering for hydration
  useEffect(() => {
    setIsHydrated(true);
    setCurrentTime(new Date()); // Set client time after hydration
  }, []);

  useEffect(() => {
    const hasActiveSessions = filteredSessions.some(
      (session) => !session.endedAt,
    );

    if (!hasActiveSessions || !isHydrated) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [filteredSessions, isHydrated]);

  return (
    <div
      className={`w-full bg-[var(--card-bg)] text-[var(--foreground)] p-4 sm:p-6 rounded-lg border border-[var(--border)] ${isFullHeight ? "h-full flex flex-col" : ""}`}
    >
      <div className={isFullHeight ? "flex-shrink-0" : ""}>
        <TimelineHeader
          viewMode={viewMode}
          dateRangeLabel={dateRangeLabel}
          onViewModeChange={handleViewModeChange}
          onNavigate={handleNavigateTime}
          isFullPage={isFullPage}
          isMobile={isMobile}
          currentDate={currentDate.toISOString()}
          stats={stats}
        />
      </div>

      <div className={isFullHeight ? "flex-1 min-h-0" : ""}>
        <TimelineGrid
          viewMode={viewMode}
          timeRange={timeRange}
          taskGroups={taskGroups}
          isMobile={isMobile}
          clickedSession={clickedSession}
          onSessionHover={handleSessionHover}
          onSessionLeave={handleSessionLeave}
          onSessionClick={handleSessionClick}
          isFullHeight={isFullHeight}
          currentTime={currentTime}
        />
      </div>

      <SessionTooltip
        hoveredSession={hoveredSession}
        hoveredPosition={hoveredPosition}
        isMobile={isMobile}
        clickedSession={clickedSession}
      />
    </div>
  );
}
