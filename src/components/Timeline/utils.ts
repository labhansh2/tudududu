import { TimelineSession } from "./actions";

export interface TimeRange {
  start: Date;
  end: Date;
  hours?: number[];
  days?: Date[];
}

export interface TaskGroup {
  taskId: string;
  taskName: string;
  sessions: TimelineSession[];
  lastActivity: Date;
}

export function getTimeRange(
  currentDate: Date,
  viewMode: "day" | "week" | "month",
): TimeRange {
  const baseDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  switch (viewMode) {
    case "day":
      return {
        start: baseDate,
        end: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
        hours: Array.from({ length: 24 }, (_, i) => i),
      };
    case "week":
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() - baseDate.getDay());
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
        days: Array.from({ length: 7 }, (_, i) => {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          return day;
        }),
      };
    case "month":
      const monthStart = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0,
      );
      return {
        start: monthStart,
        end: new Date(
          monthStart.getTime() + monthEnd.getDate() * 24 * 60 * 60 * 1000,
        ),
        days: Array.from({ length: monthEnd.getDate() }, (_, i) => {
          const day = new Date(monthStart);
          day.setDate(i + 1);
          return day;
        }),
      };
    default:
      return { start: baseDate, end: baseDate };
  }
}

export function getDateRangeLabel(
  currentDate: Date,
  viewMode: "day" | "week" | "month",
): string {
  const range = getTimeRange(currentDate, viewMode);

  switch (viewMode) {
    case "day":
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "week":
      const weekEnd = new Date(range.end.getTime() - 24 * 60 * 60 * 1000);
      return `${range.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    case "month":
      return currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    default:
      return "";
  }
}

export function formatDuration(start: Date, end: Date): string {
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getStatusColor(
  status: TimelineSession["taskStatus"],
): string {
  switch (status) {
    case "completed":
      return "bg-[var(--secondary)]"; // Gray for completed
    case "active":
      return "bg-[var(--accent)]"; // Main accent color for active
    case "not_active":
      return "bg-[var(--success)]"; // Green for not active
    default:
      return "bg-[var(--secondary)]";
  }
}

export function getSessionPosition(
  session: TimelineSession,
  timeRange: TimeRange,
  viewMode: "day" | "week" | "month",
): { left: string; width: string } {
  const rangeStart = timeRange.start.getTime();
  const rangeEnd = timeRange.end.getTime();
  const sessionStart = session.startedAt.getTime();
  const sessionEnd = session.endedAt
    ? session.endedAt.getTime()
    : new Date().getTime(); // use current time for active sessions

  // clip session to visible time range
  const visibleStart = Math.max(sessionStart, rangeStart);
  const visibleEnd = Math.min(sessionEnd, rangeEnd);

  if (viewMode === "day") {
    const left =
      ((visibleStart - rangeStart) / (24 * 60 * 60 * 1000)) * 100;
    const width =
      ((visibleEnd - visibleStart) / (24 * 60 * 60 * 1000)) * 100;
    // round to 2 decimal places for consistent server/client rendering
    return {
      left: `${Math.round(left * 100) / 100}%`,
      width: `${Math.round(Math.max(width, 0.5) * 100) / 100}%`,
    };
  } else {
    const left =
      ((visibleStart - rangeStart) / (rangeEnd - rangeStart)) * 100;
    const width =
      ((visibleEnd - visibleStart) / (rangeEnd - rangeStart)) * 100;
    // round to 2 decimal places for consistent server/client rendering
    return {
      left: `${Math.round(left * 100) / 100}%`,
      width: `${Math.round(Math.max(width, 0.5) * 100) / 100}%`,
    };
  }
}

export function navigateDate(
  currentDate: Date,
  direction: "next" | "prev",
  viewMode: "day" | "week" | "month",
): Date {
  const newDate = new Date(currentDate);

  switch (viewMode) {
    case "day":
      newDate.setDate(
        currentDate.getDate() + (direction === "next" ? 1 : -1),
      );
      break;
    case "week":
      newDate.setDate(
        currentDate.getDate() + (direction === "next" ? 7 : -7),
      );
      break;
    case "month":
      newDate.setMonth(
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
      );
      break;
  }

  return newDate;
}

export function groupSessionsByTask(sessions: TimelineSession[]) {
  const groups: Record<
    string,
    {
      taskId: string;
      taskName: string;
      sessions: TimelineSession[];
      lastActivity: Date;
    }
  > = {};

  sessions.forEach((session) => {
    if (!groups[session.taskId]) {
      groups[session.taskId] = {
        taskId: session.taskId,
        taskName: session.taskName,
        sessions: [],
        lastActivity: session.startedAt,
      };
    }
    groups[session.taskId].sessions.push(session);
    const sessionEnd = session.endedAt || new Date();
    if (sessionEnd > groups[session.taskId].lastActivity) {
      groups[session.taskId].lastActivity = sessionEnd;
    }
  });

  return Object.values(groups).sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
  );
}

export function getDateRangeForView(
  currentDate: Date,
  viewMode: "day" | "week" | "month",
): { startDate: Date; endDate: Date } {
  const baseDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  switch (viewMode) {
    case "day":
      const dayStart = baseDate;
      const dayEnd = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      return { startDate: dayStart, endDate: dayEnd };

    case "week":
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() - baseDate.getDay());
      const weekEnd = new Date(
        weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      return { startDate: weekStart, endDate: weekEnd };

    case "month":
      const monthStart = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        1,
      );
      return { startDate: monthStart, endDate: monthEnd };

    default:
      return { startDate: baseDate, endDate: baseDate };
  }
}
