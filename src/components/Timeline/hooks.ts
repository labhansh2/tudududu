import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TimelineSession } from "./actions";
import { navigateDate, parseLocalDate, formatLocalDate } from "./utils";

export function useURLSync(
  initialViewMode: "day" | "week" | "month",
  initialCurrentDate?: string,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"day" | "week" | "month">(
    initialViewMode,
  );
  const [currentDate, setCurrentDate] = useState(
    initialCurrentDate ? parseLocalDate(initialCurrentDate) : new Date(),
  );

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

    router.push(`?${params.toString()}`);
  };

  const handleViewModeChange = (newViewMode: "day" | "week" | "month") => {
    setViewMode(newViewMode);
    updateURL(newViewMode, undefined);
  };

  const handleNavigateTime = (direction: "next" | "prev") => {
    const newDate = navigateDate(currentDate, direction, viewMode);
    setCurrentDate(newDate);
    updateURL(undefined, newDate);
  };

  return {
    viewMode,
    currentDate,
    handleViewModeChange,
    handleNavigateTime,
  };
}

export function useSessionInteraction(isMobile: boolean) {
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
      // Close if clicking the same session
      setClickedSession(null);
      setHoveredPosition(null);
    } else {
      // Open new session
      setClickedSession(session);
      setHoveredSession(session);
      setHoveredPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  // Close clicked session when clicking outside (mobile)
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

  return {
    hoveredSession,
    hoveredPosition,
    clickedSession,
    handleSessionHover,
    handleSessionLeave,
    handleSessionClick,
  };
}
