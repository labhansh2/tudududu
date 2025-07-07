export interface Session {
  sessionId: string;
  taskId: string;
  taskName: string;
  taskStatus: "completed" | "active" | "not_active";
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date | null; // null for active sessions
}

export const sessionsData: Session[] = [
  {
    sessionId: "1",
    taskId: "task-1",
    taskName: "Frontend Development",
    taskStatus: "completed",
    updatedAt: new Date("2025-07-01T09:00:00"),
    startedAt: new Date("2025-07-01T09:00:00"),
    endedAt: new Date("2025-07-01T11:30:00"),
  },
  {
    sessionId: "2",
    taskId: "task-1",
    taskName: "Frontend Development",
    taskStatus: "completed",
    updatedAt: new Date("2025-07-01T14:00:00"),
    startedAt: new Date("2025-07-01T14:00:00"),
    endedAt: new Date("2025-07-01T16:15:00"),
  },
  {
    sessionId: "3",
    taskId: "task-2",
    taskName: "API Integration",
    taskStatus: "completed",
    updatedAt: new Date("2025-07-01T11:45:00"),
    startedAt: new Date("2025-07-01T11:45:00"),
    endedAt: new Date("2025-07-01T13:30:00"),
  },
  {
    sessionId: "4",
    taskId: "task-3",
    taskName: "Database Design",
    taskStatus: "active",
    updatedAt: new Date("2025-07-01T16:30:00"),
    startedAt: new Date("2025-07-01T16:30:00"),
    endedAt: null, // Active session - ongoing
  },
  {
    sessionId: "5",
    taskId: "task-1",
    taskName: "Frontend Development",
    taskStatus: "completed",
    updatedAt: new Date("2025-06-30T10:00:00"),
    startedAt: new Date("2025-06-30T10:00:00"),
    endedAt: new Date("2025-06-30T12:00:00"),
  },
  {
    sessionId: "6",
    taskId: "task-2",
    taskName: "API Integration",
    taskStatus: "not_active",
    updatedAt: new Date("2025-06-30T13:00:00"),
    startedAt: new Date("2025-06-30T13:00:00"),
    endedAt: new Date("2025-06-30T15:30:00"),
  },
  {
    sessionId: "7",
    taskId: "task-4",
    taskName: "Testing & QA",
    taskStatus: "not_active",
    updatedAt: new Date("2025-06-29T09:30:00"),
    startedAt: new Date("2025-06-29T09:30:00"),
    endedAt: new Date("2025-06-29T11:00:00"),
  },
  {
    sessionId: "8",
    taskId: "task-3",
    taskName: "Database Design",
    taskStatus: "completed",
    updatedAt: new Date("2025-06-29T14:00:00"),
    startedAt: new Date("2025-06-29T14:00:00"),
    endedAt: new Date("2025-06-29T17:00:00"),
  },
  {
    sessionId: "9",
    taskId: "task-1",
    taskName: "Frontend Development",
    taskStatus: "completed",
    updatedAt: new Date("2025-06-28T08:00:00"),
    startedAt: new Date("2025-06-28T08:00:00"),
    endedAt: new Date("2025-06-28T10:30:00"),
  },
  {
    sessionId: "10",
    taskId: "task-5",
    taskName: "Code Review",
    taskStatus: "completed",
    updatedAt: new Date("2025-06-28T11:00:00"),
    startedAt: new Date("2025-06-28T11:00:00"),
    endedAt: new Date("2025-06-29T03:30:00"),
  },
];
