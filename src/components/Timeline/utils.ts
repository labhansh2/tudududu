import { format, fromZonedTime } from "date-fns-tz";
import {
  type TimelineSession,
  type TaskWithSessions,
  View,
  Direction,
} from "./types";

/*
 * formats the duration of a session
 * used in session tooltip
 */
export function formatDuration(start: Date, end: Date): string {
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/*
 * gets label to display in date navigation according to view and range
 */
export function getDateRangeLabel(
  dateRange: { startDate: Date; endDate: Date },
  dateView: View,
  isMobile: boolean = false,
) {
  if (dateView === View.DAY) {
    return format(dateRange.startDate, "d MMMM yyyy");
  } else if (dateView === View.WEEK) {
    // For mobile, use shorter format
    if (isMobile) {
      return `${format(dateRange.startDate, "d MMM")} - ${format(dateRange.endDate, "d MMM")}`;
    }
    // For desktop, check if same month
    const startMonth = format(dateRange.startDate, "MMMM");
    const endMonth = format(dateRange.endDate, "MMMM");
    const startYear = format(dateRange.startDate, "yyyy");
    const endYear = format(dateRange.endDate, "yyyy");

    if (startMonth === endMonth && startYear === endYear) {
      return `${format(dateRange.startDate, "d")} - ${format(dateRange.endDate, "d")} ${startMonth} ${startYear}`;
    }
    return `${format(dateRange.startDate, "d MMM")} - ${format(dateRange.endDate, "d MMM yyyy")}`;
  } else {
    return format(dateRange.startDate, "MMMM yyyy");
  }
}

/*
 * gets position styles for session bard based on date range
 * of the session
 */
export function getSessionPosition(
  session: TimelineSession,
  dateRange: { startDate: Date; endDate: Date },
  dateView: View,
): { left: string; width: string } {
  const rangeStart = dateRange.startDate.getTime();
  const rangeEnd = dateRange.endDate.getTime();
  const sessionStart = session.startedAt.getTime();
  const sessionEnd = session.endedAt
    ? session.endedAt.getTime()
    : new Date().getTime();

  // clip session to visible time range
  const visibleStart = Math.max(sessionStart, rangeStart);
  const visibleEnd = Math.min(sessionEnd, rangeEnd);

  if (dateView == View.DAY) {
    const left =
      ((visibleStart - rangeStart) / (24 * 60 * 60 * 1000)) * 100;
    const width =
      ((visibleEnd - visibleStart) / (24 * 60 * 60 * 1000)) * 100;
    return {
      left: `${Math.round(left * 100) / 100}%`,
      width: `${Math.round(Math.max(width, 0.5) * 100) / 100}%`,
    };
  } else {
    const left =
      ((visibleStart - rangeStart) / (rangeEnd - rangeStart)) * 100;
    const width =
      ((visibleEnd - visibleStart) / (rangeEnd - rangeStart)) * 100;
    return {
      left: `${Math.round(left * 100) / 100}%`,
      width: `${Math.round(Math.max(width, 0.5) * 100) / 100}%`,
    };
  }
}

/*
 * handles date navigation by returning new date with
 * increased or decreased days in referenceDate according to
 * the view and direction
 */
export function navigateDate(
  referenceDate: string,
  direction: Direction,
  viewMode: View,
): string {
  const [year, month, day] = referenceDate.split("-").map(Number);
  const currentDate = new Date(year, month - 1, day);
  const newDate = new Date(year, month - 1, day);

  switch (viewMode) {
    case View.DAY:
      newDate.setDate(currentDate.getDate() + direction);
      break;
    case View.WEEK:
      newDate.setDate(currentDate.getDate() + direction * 7);
      break;
    case View.MONTH:
      newDate.setMonth(currentDate.getMonth() + direction);
      break;
  }

  return format(newDate, "yyyy-MM-dd");
}

/*
 * transforms sessions into tasks with sessions
 */
export function groupSessionsByTask(
  sessions: TimelineSession[],
): TaskWithSessions[] {
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

/**
 * gets range in utc for a given view
 * i.e midnight user tz yyyy-mm-dd to midnight utc
 */
export function getDateRangeForView(
  referenceDate: string,
  timezone: string,
  view: View,
): { startDate: Date; endDate: Date } {
  const start = fromZonedTime(`${referenceDate}T00:00:00`, timezone);
  const end = fromZonedTime(`${referenceDate}T00:00:00`, timezone);

  switch (view) {
    case View.DAY:
      end.setDate(start.getDate() + 1);

      return { startDate: start, endDate: end };

    case View.WEEK:
      const dayOfWeek = start.getDay();

      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(end.getDate() + (7 - dayOfWeek));

      return { startDate: start, endDate: end };

    case View.MONTH:
      start.setDate(1);
      end.setDate(1);
      end.setMonth(start.getMonth() + 1);

      return { startDate: start, endDate: end };

    default:
      return { startDate: start, endDate: end };
  }
}

// -------------------------------------------------
// Conditional styles
// -------------------------------------------------

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

export function getTimeLineLayoutStyles(
  isFullPage: boolean,
  isFullHeight: boolean,
) {
  let classes = "w-full bg-[var(--card-bg)] text-[var(--foreground)]";

  if (isFullPage) {
    classes += " h-full flex flex-col p-4";
  } else {
    // Add shadow like activity map
    classes += " p-4 sm:p-6 rounded-lg shadow-[var(--shadow-sm)]";
    if (isFullHeight) {
      classes += " h-full flex flex-col";
    }
  }

  return classes;
}
