export interface Task {
  id: number;
  name: string;
  status: "active" | "not_active" | "completed";
  updatedAt: Date;
  createdAt: Date;
  userId: string;
  deadline?: Date | null;
}

export interface Session {
  sessionId: number;
  userId: string;
  taskId: number;
  startedAt: Date;
  endedAt: Date;
}

export interface Activity {
  date: string;
  count: number;
  level: number;
}

export interface WorkTimeData {
  date: Date;
  total_seconds: number;
}
