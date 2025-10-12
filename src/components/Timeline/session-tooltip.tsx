"use client";

import { useMobile } from "@/hooks/useMobile";

import { useSessionTooltip } from "./context";
import { formatDuration } from "./utils";

export default function SessionTooltip() {
  const { hoveredSession, hoveredPosition, clickedSession } =
    useSessionTooltip();

  const isMobile = useMobile();

  if (
    !hoveredSession ||
    !hoveredPosition ||
    (!isMobile && !hoveredSession) ||
    (isMobile && !clickedSession)
  ) {
    return null;
  }

  const getTooltipTransform = () => {
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const rightEdge = hoveredPosition.x + tooltipWidth / 2;
    const leftEdge = hoveredPosition.x - tooltipWidth / 2;

    if (rightEdge > window.innerWidth - 16) {
      // Too close to right edge - align tooltip right edge with screen
      return "translate(-100%, -100%)";
    } else if (leftEdge < 16) {
      // Too close to left edge - align tooltip left edge with screen
      return "translate(0%, -100%)";
    } else {
      // Enough space on both sides - center the tooltip
      return "translate(-50%, -100%)";
    }
  };

  const getStatusDisplay = () => {
    if (
      hoveredSession.taskStatus === "active" &&
      !hoveredSession.endedAt
    ) {
      return "ongoing";
    }
    return hoveredSession.taskStatus.replace("_", " ");
  };

  const getStatusColorClass = () => {
    switch (hoveredSession.taskStatus) {
      case "completed":
        return "bg-[var(--secondary)]";
      case "active":
        return "bg-[var(--accent)]";
      case "not_active":
        return "bg-[var(--success)]";
      default:
        return "bg-[var(--secondary)]";
    }
  };

  return (
    <div
      className="fixed z-50 bg-[var(--bg-lightest)] rounded-[var(--border-radius)] p-4 pointer-events-none w-72 max-w-[calc(100vw-2rem)]"
      style={{
        left: `${hoveredPosition.x}px`,
        top: `${Math.max(16, hoveredPosition.y - 10)}px`,
        transform: getTooltipTransform(),
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div className="text-xs text-[var(--secondary)] space-y-2 font-medium">
        <div className="break-words">
          {hoveredSession.startedAt.toLocaleDateString()} •{" "}
          {hoveredSession.startedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {hoveredSession.endedAt
            ? hoveredSession.endedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "ongoing"}
        </div>
        <div>
          Duration:{" "}
          <span className="font-bold text-[var(--foreground)]">
            {formatDuration(
              hoveredSession.startedAt,
              hoveredSession.endedAt || new Date(),
            )}
          </span>
        </div>
        <div className="capitalize">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${getStatusColorClass()} relative overflow-hidden inline-block`}
            style={{
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {getStatusDisplay()}
          </span>
        </div>
      </div>
    </div>
  );
}
