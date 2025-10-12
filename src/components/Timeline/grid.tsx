"use client";

import { useState, useEffect } from "react";

import { useMobile } from "@/hooks/useMobile";

import {
  useTimelineData,
  useTimelineDate,
  useTimelineView,
  useSessionTooltip,
} from "./context";
import { type TimelineSession, type TaskWithSessions } from "./types";
import { getSessionPosition, getStatusColor } from "./utils";

export default function TimelineGrid() {
  const { isFullHeight, isFullPage } = useTimelineView();
  const { sessionsDataByTask } = useTimelineData();

  return (
    <div className={isFullHeight || isFullPage ? "flex-1 min-h-0" : ""}>
      <div
        className={`space-y-3 overflow-x-auto ${
          isFullHeight
            ? "h-full flex flex-col"
            : "h-full flex flex-col overflow-y-auto"
        }`}
      >
        <div
          className={`min-w-[600px] sm:min-w-0 ${
            isFullHeight
              ? "flex flex-col h-full"
              : "flex flex-col h-full overflow-y-auto"
          }`}
        >
          <TimeLabels />

          {/* Timeline grid with task rows */}
          <div
            className={`relative flex-1 min-h-0 ${
              isFullHeight ? "" : ""
            }`}
          >
            <GridLines />

            {/* Task rows - scrollable when in full height mode */}
            <div
              className={`space-y-3 ${
                isFullHeight
                  ? "overflow-y-auto h-full pr-2"
                  : "h-full"
              }`}
            >
              {sessionsDataByTask.map((task) => (
                <TaskRow key={task.taskId} taskWithSessions={task} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskRowProps {
  taskWithSessions: TaskWithSessions;
}

function TaskRow({ taskWithSessions }: TaskRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <div className="text-xs text-[var(--foreground)] font-medium">
          {taskWithSessions.taskName}
        </div>
      </div>

      {/* Sessions row */}
      <div 
        className="relative h-10 rounded-md overflow-hidden bg-[var(--input-bg-inset)]"
        style={{ 
          boxShadow: 'var(--shadow-inset)'
        }}
      >
        {/* Sessions */}
        {taskWithSessions.sessions.map((session) => (
          <SessionBar key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}

interface SessionBarProps {
  session: TimelineSession;
}

function SessionBar({ session }: SessionBarProps) {
  const isMobile = useMobile();

  const { dateRange, view } = useTimelineDate();
  const {
    clickedSession,
    handleSessionHover,
    handleSessionLeave,
    handleSessionClick,
  } = useSessionTooltip();

  const isActive = !session.endedAt;

  const [position, setPosition] = useState(
    getSessionPosition(session, dateRange, view),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPosition(getSessionPosition(session, dateRange, view));
  }, [session, dateRange, view]);

  useEffect(() => {
    setIsHydrated(true);

    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setPosition(getSessionPosition(session, dateRange, view));
    }, 60000);

    return () => clearInterval(interval);
  }, [session, dateRange, view, isActive]);

  const statusColor = getStatusColor(session.taskStatus);

  if (isActive && !isHydrated) {
    return null;
  }

  return (
    <div
      className={`absolute top-1.5 bottom-1.5 ${statusColor} rounded cursor-pointer transition-all z-20 min-w-[4px] ${
        isMobile && clickedSession?.sessionId === session.sessionId
          ? "ring-1 ring-[var(--accent)]"
          : ""
      } ${isActive ? "animate-pulse" : ""}`}
      style={{
        ...position,
        boxShadow: isActive 
          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(5, 150, 105, 0.4)' 
          : 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)'
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          const rect = e.currentTarget.getBoundingClientRect();
          handleSessionHover(session, rect);
          if (!isActive) {
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          handleSessionLeave();
          if (!isActive) {
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)';
          }
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isMobile) {
          const rect = e.currentTarget.getBoundingClientRect();
          handleSessionClick(session, rect);
        }
      }}
    ></div>
  );
}

function TimeLabels() {
  const { view, dateRange } = useTimelineDate();
  const { isFullHeight } = useTimelineView();
  const [sundayLabels, setSundayLabels] = useState<
    { position: number; sunday: Date; weekEnd: Date; weekNumber: number }[]
  >([]);

  useEffect(() => {
    // THIS FUNCTION IS WRITTEN BY AI (DO NOT TRUST) but it works
    if (view === "month") {
      const firstDay = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth(),
        1,
      );
      const lastDay = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth() + 1,
        0,
      );

      const firstWeekStart = new Date(firstDay);
      firstWeekStart.setDate(firstDay.getDate() - firstDay.getDay());

      const labels: {
        position: number;
        sunday: Date;
        weekEnd: Date;
        weekNumber: number;
      }[] = [];
      const currentDate = new Date(firstDay);
      const rangeStart = dateRange.startDate.getTime();
      const rangeEnd = dateRange.endDate.getTime();

      while (currentDate <= lastDay) {
        if (currentDate.getDay() === 0) {
          const sunday = new Date(currentDate);
          const sundayMidnight = new Date(currentDate);
          sundayMidnight.setHours(0, 0, 0, 0);

          const weekEnd = new Date(sunday);
          weekEnd.setDate(sunday.getDate() + 6);
          if (weekEnd > lastDay) {
            weekEnd.setTime(lastDay.getTime());
          }

          const weeksDiff = Math.floor(
            (sunday.getTime() - firstWeekStart.getTime()) /
              (7 * 24 * 60 * 60 * 1000),
          );
          const weekNumber = weeksDiff + 1;

          const position =
            ((sundayMidnight.getTime() - rangeStart) /
              (rangeEnd - rangeStart)) *
            100;
          labels.push({
            position: Math.round(position * 100) / 100,
            sunday,
            weekEnd,
            weekNumber,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSundayLabels(labels);
    }
  }, [view, dateRange]);

  if (view === "day") {
    return (
      <div className={`${isFullHeight ? "flex-shrink-0" : ""} mb-3`}>
        <div className="flex text-xs text-[var(--secondary)] font-medium relative">
          {Array.from({ length: 24 }, (_, index) => (
            <div key={index} className="flex-1 text-left pl-0.5">
              <span
                className={`${index % 2 === 0 ? "block" : "hidden sm:hidden md:hidden lg:block"}`}
              >
                {index === 0
                  ? "12AM"
                  : index < 12
                    ? `${index}AM`
                    : index === 12
                      ? "12PM"
                      : `${index - 12}PM`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (view === "week") {
    return (
      <div className={`${isFullHeight ? "flex-shrink-0" : ""} mb-3`}>
        <div className="flex text-xs text-[var(--secondary)] font-medium relative">
          {Array.from({ length: 7 }, (_, index) => {
            const day = new Date(dateRange.startDate);
            day.setDate(dateRange.startDate.getDate() + index);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 text-left pl-0.5"
              >
                <div className="hidden sm:block">
                  {day.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                  })}
                </div>
                <div className="sm:hidden">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div className={`${isFullHeight ? "flex-shrink-0" : ""} mb-3`}>
        <div className="relative text-xs text-[var(--secondary)] font-medium h-6">
          {sundayLabels.map((label, index) => {
            let alignmentClass = "text-center transform -translate-x-1/2";
            if (label.position < 10) {
              alignmentClass = "text-left";
            } else if (label.position > 90) {
              alignmentClass = "text-right transform -translate-x-full";
            }

            return (
              <div
                key={label.sunday.toISOString()}
                className={`absolute ${alignmentClass}`}
                style={{ left: `${label.position}%` }}
              >
                <div className="whitespace-nowrap">
                  Week {label.weekNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

function GridLines() {
  const { view, dateRange } = useTimelineDate();
  const [sundayPositions, setSundayPositions] = useState<number[]>([]);

  useEffect(() => {
    // THIS FUNCTION IS WRITTEN BY AI (DO NOT TRUST) but it works
    if (view === "month") {
      const firstDay = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth(),
        1,
      );
      const lastDay = new Date(
        dateRange.startDate.getFullYear(),
        dateRange.startDate.getMonth() + 1,
        0,
      );

      const positions: number[] = [];
      const currentDate = new Date(firstDay);
      const rangeStart = dateRange.startDate.getTime();
      const rangeEnd = dateRange.endDate.getTime();

      while (currentDate <= lastDay) {
        if (currentDate.getDay() === 0) {
          const sundayMidnight = new Date(currentDate);
          sundayMidnight.setHours(0, 0, 0, 0);
          const position =
            ((sundayMidnight.getTime() - rangeStart) /
              (rangeEnd - rangeStart)) *
            100;
          positions.push(Math.round(position * 100) / 100);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setSundayPositions(positions);
    }
  }, [view, dateRange]);

  if (view === "day") {
    return (
      <div className="absolute inset-0 flex opacity-40">
        {Array.from({ length: 24 }, (_, index) => (
          <div
            key={index}
            className="flex-1 border-l border-[var(--border)] first:border-l-0"
          />
        ))}
      </div>
    );
  } else if (view === "week") {
    return (
      <div className="absolute inset-0 flex opacity-40">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className="flex-1 border-l border-[var(--border)] first:border-l-0"
          />
        ))}
      </div>
    );
  } else {
    // render using client calc
    return (
      <div className="absolute inset-0 opacity-40">
        {sundayPositions.map((position, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 border-l border-[var(--border)]"
            style={{ left: `${position}%` }}
          />
        ))}
      </div>
    );
  }
}
