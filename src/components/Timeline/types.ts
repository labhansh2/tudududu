export enum View {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export enum Direction {
  NEXT = 1,
  PREV = -1,
}

export interface TimelineSession {
  sessionId: string;
  taskId: string;
  taskName: string;
  taskStatus: "completed" | "active" | "not_active";
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date | null;
}

// TODO: low : can add more stats
export interface TimelineStats {
  total_hours: number;
}

export interface TaskWithSessions {
  taskId: string;
  taskName: string;
  sessions: TimelineSession[];
  lastActivity: Date;
}
