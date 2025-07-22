"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useMobile } from "@/hooks/useMobile";

import {
  type TimelineSession,
  type TimelineStats,
  type TaskWithSessions,
  View,
  Direction,
} from "./types";
import { groupSessionsByTask, navigateDate } from "./utils";

interface TimelineDataContextType {
  sessionsDataByTask: TaskWithSessions[];
  statsData: TimelineStats;
}

interface TimelineDateContextType {
  view: View;
  referenceDate: string;
  timezone: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  setView: (view: View) => void;
  handleNavigateTime: (direction: Direction) => void;
}

interface TimelineViewContextType {
  isFullHeight: boolean;
  isFullPage: boolean;
}

interface SessionTooltipContextType {
  hoveredSession: TimelineSession | null;
  hoveredPosition: { x: number; y: number } | null;
  clickedSession: TimelineSession | null;
  handleSessionHover: (session: TimelineSession, rect: DOMRect) => void;
  handleSessionLeave: () => void;
  handleSessionClick: (session: TimelineSession, rect: DOMRect) => void;
}

const TimelineDataContext = createContext<
  TimelineDataContextType | undefined
>(undefined);

const TimelineDateContext = createContext<
  TimelineDateContextType | undefined
>(undefined);

const TimelineViewContext = createContext<
  TimelineViewContextType | undefined
>(undefined);

const SessionTooltipContext = createContext<
  SessionTooltipContextType | undefined
>(undefined);

export function TimelineDataProvider({
  children,
  sessionsData,
  statsData,
}: {
  children: React.ReactNode;
  sessionsData: TimelineSession[];
  statsData: TimelineStats;
}) {
  const sessionsDataByTask: TaskWithSessions[] = useMemo(
    () => groupSessionsByTask(sessionsData),
    [sessionsData],
  );

  return (
    <TimelineDataContext
      value={{
        sessionsDataByTask,
        statsData,
      }}
    >
      {children}
    </TimelineDataContext>
  );
}

export function TimelineDateProvider({
  children,
  referenceDate,
  timezone,
  dateRange,
  view = View.DAY,
}: {
  children: React.ReactNode;
  referenceDate: string;
  timezone: string;
  dateRange: { startDate: Date; endDate: Date };
  view: View;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUrl = (view?: View, date?: string) => {
    const params = new URLSearchParams(searchParams);
    if (view) params.set("view", view);
    if (date) params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  };

  const setView = (view: View) => {
    updateUrl(view, referenceDate);
  };

  const handleNavigateTime = (direction: Direction) => {
    const newDate = navigateDate(referenceDate, direction, view);
    updateUrl(view, newDate);
  };

  return (
    <TimelineDateContext
      value={{
        view,
        referenceDate,
        timezone,
        dateRange,
        setView,
        handleNavigateTime,
      }}
    >
      {children}
    </TimelineDateContext>
  );
}

export function TimelineViewProvider({
  children,
  isFullHeight,
  isFullPage,
}: {
  children: React.ReactNode;
  isFullHeight: boolean;
  isFullPage: boolean;
}) {
  return (
    <TimelineViewContext value={{ isFullHeight, isFullPage }}>
      {children}
    </TimelineViewContext>
  );
}

export function SessionTooltipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMobile();
  const [hoveredSession, setHoveredSession] =
    useState<TimelineSession | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickedSession, setClickedSession] =
    useState<TimelineSession | null>(null);

  const handleSessionHover = (session: TimelineSession, rect: DOMRect) => {
    setHoveredSession(session);
    setHoveredPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleSessionLeave = () => {
    setHoveredSession(null);
    setHoveredPosition(null);
  };

  const handleSessionClick = (session: TimelineSession, rect: DOMRect) => {
    if (clickedSession?.sessionId === session.sessionId) {
      // close if clicking the same session
      setClickedSession(null);
      setHoveredPosition(null);
    } else {
      // open new session
      setClickedSession(session);
      setHoveredSession(session);
      setHoveredPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  // close clicked session when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobile && clickedSession) {
        setClickedSession(null);
        setHoveredPosition(null);
      }
    };

    if (isMobile) {
      document.addEventListener("click", handleClickOutside);
      return () =>
        document.removeEventListener("click", handleClickOutside);
    }
  }, [isMobile, clickedSession]);
  return (
    <SessionTooltipContext
      value={{
        hoveredSession,
        hoveredPosition,
        clickedSession,
        handleSessionHover,
        handleSessionLeave,
        handleSessionClick,
      }}
    >
      {children}
    </SessionTooltipContext>
  );
}

export function useTimelineView() {
  const context = useContext(TimelineViewContext);
  if (!context) {
    throw new Error(
      "useTimelineView must be used within a TimelineViewProvider",
    );
  }
  return context;
}

export function useTimelineDate() {
  const context = useContext(TimelineDateContext);
  if (!context) {
    throw new Error(
      "useTimelineDate must be used within a TimelineDateProvider",
    );
  }
  return context;
}

export function useTimelineData() {
  const context = useContext(TimelineDataContext);
  if (!context) {
    throw new Error(
      "useTimelineData must be used within a TimelineDataProvider",
    );
  }
  return context;
}

export function useSessionTooltip() {
  const context = useContext(SessionTooltipContext);
  if (!context) {
    throw new Error(
      "useSessionTooltip must be used within a SessionTooltipProvider",
    );
  }
  return context;
}
