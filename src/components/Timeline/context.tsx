"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useMobile } from "@/hooks/useMobile";

import { TimelineSession as Session, TimelineStats } from "./actions";
import {
  getTimeRange,
  getDateRangeLabel,
  groupSessionsByTask,
  navigateDate,
  parseLocalDate,
  formatLocalDate,
} from "./utils";

interface TimelineContextType {
  // view and date state
  viewMode: "day" | "week" | "month";
  currentDate: Date;
  setViewMode: (mode: "day" | "week" | "month") => void;
  handleNavigateTime: (direction: "next" | "prev") => void;

  // data
  sessionsData: Session[];
  stats: TimelineStats;

  // computed values
  timeRange: { start: Date; end: Date; hours?: number[]; days?: Date[] };
  dateRangeLabel: string;
  filteredSessions: Session[];
  taskGroups: Array<{
    taskId: string;
    taskName: string;
    sessions: Session[];
    lastActivity: Date;
  }>;

  // session interaction
  hoveredSession: Session | null;
  hoveredPosition: { x: number; y: number } | null;
  clickedSession: Session | null;
  handleSessionHover: (session: Session, rect: DOMRect) => void;
  handleSessionLeave: () => void;
  handleSessionClick: (session: Session, rect: DOMRect) => void;

  // ui state
  isMobile: boolean;
  isFullHeight: boolean;
  isFullPage: boolean;
  currentTime: Date;
}

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined,
);

interface TimelineProviderProps {
  children: ReactNode;
  sessionsData: Session[];
  stats: TimelineStats;
  initialViewMode?: "day" | "week" | "month";
  initialCurrentDate?: string;
  isFullHeight?: boolean;
  isFullPage?: boolean;
}

export function TimelineProvider({
  children,
  sessionsData,
  stats,
  initialViewMode = "week",
  initialCurrentDate,
  isFullHeight = false,
  isFullPage = true,
}: TimelineProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMobile();

  // core state
  const [viewMode, setViewModeState] = useState<"day" | "week" | "month">(
    initialViewMode,
  );
  const [currentDate, setCurrentDate] = useState(
    initialCurrentDate ? parseLocalDate(initialCurrentDate) : new Date(),
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // session interaction state
  const [hoveredSession, setHoveredSession] = useState<Session | null>(
    null,
  );
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickedSession, setClickedSession] = useState<Session | null>(
    null,
  );

  // update current time every minute for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

  // url sync logic
  const updateURL = (
    newViewMode?: "day" | "week" | "month",
    newDate?: Date,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newViewMode) {
      params.set("view", newViewMode);
    }
    if (newDate) {
      params.set("date", formatLocalDate(newDate));
    }

    // Use current pathname to maintain the route (works for both embedded and full screen)
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?${params.toString()}`);
  };

  const setViewMode = (newViewMode: "day" | "week" | "month") => {
    setViewModeState(newViewMode);
    updateURL(newViewMode, undefined);
  };

  const handleNavigateTime = (direction: "next" | "prev") => {
    const newDate = navigateDate(currentDate, direction, viewMode);
    setCurrentDate(newDate);
    updateURL(undefined, newDate);
  };

  // session interaction handlers
  const handleSessionHover = (session: Session, rect: DOMRect) => {
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

  const handleSessionClick = (session: Session, rect: DOMRect) => {
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

  // computed values
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

  const contextValue: TimelineContextType = {
    // view and date state
    viewMode,
    currentDate,
    setViewMode,
    handleNavigateTime,

    // data
    sessionsData,
    stats,

    // computed values
    timeRange,
    dateRangeLabel,
    filteredSessions,
    taskGroups,

    // session interaction
    hoveredSession,
    hoveredPosition,
    clickedSession,
    handleSessionHover,
    handleSessionLeave,
    handleSessionClick,

    // ui state
    isMobile,
    isFullHeight,
    isFullPage,
    currentTime,
  };

  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}
