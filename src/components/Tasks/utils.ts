import { type SparklineData } from "./actions";

export const getTaskStyles = (
  taskStatus: "active" | "not_active" | "completed",
) => {
  switch (taskStatus) {
    case "completed":
      return "bg-[var(--completed-task)] border-[var(--border)]";
    case "active":
      return "bg-[var(--active-task)] border-[var(--accent)]";
    default:
      return "bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--accent)]/50";
  }
};

export function fillMissingDays(
  sparklineData: SparklineData[],
  taskId: number,
): SparklineData[] {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return days.map((day) => {
    const dayData = sparklineData.find((d) => d.day == day);
    return {
      taskId,
      day: Number(dayData?.day || day),
      hours: Number(dayData?.hours || 0),
    };
  });
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

export function calculateTimeRemaining(timeDiff: number): TimeRemaining {
  if (timeDiff < 0) {
    // Overdue - calculate how much time has passed
    const absoluteDiff = Math.abs(timeDiff);
    const days = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (absoluteDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (absoluteDiff % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isOverdue: true };
  }

  // Not overdue yet
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isOverdue: false };
}

export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  const { days, hours, minutes, seconds } = timeRemaining;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function calculateLateBy(
  deadline: Date,
  completedAt: Date,
): string {
  const diff = completedAt.getTime() - deadline.getTime();

  if (diff <= 0) return "";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helpers for early/overdue and border classes
export function calculateEarlyBy(
  deadline: Date,
  completedAt: Date,
): string {
  const diff = deadline.getTime() - completedAt.getTime();
  if (diff <= 0) return "";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function isDeadlineOverdue(
  deadline: Date | string | null,
): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function wasCompletedAfterDeadline(
  status: "active" | "not_active" | "completed",
  deadline: Date | string | null,
  updatedAt: Date | string,
): boolean {
  if (status !== "completed" || !deadline) return false;
  return new Date(updatedAt).getTime() > new Date(deadline).getTime();
}

export function getDeadlineBorderClasses(
  status: "active" | "not_active" | "completed",
  deadline: Date | string | null,
  updatedAt: Date | string,
): string {
  const overdue = isDeadlineOverdue(deadline);
  const completedLate = wasCompletedAfterDeadline(
    status,
    deadline,
    updatedAt,
  );

  let overdueClasses = "";
  if (overdue && status !== "completed") {
    const diffSeconds = deadline
      ? Math.floor((Date.now() - new Date(deadline).getTime()) / 1000)
      : 0;
    const withinSixHours = diffSeconds < 6 * 60 * 60;
    overdueClasses = withinSixHours
      ? "border-orange-500/30 shadow-sm shadow-orange-500/10" // < 6h overdue → orange
      : "border-red-500/50 shadow-sm shadow-red-500/10"; // ≥ 6h overdue → red
  }

  let completedClasses = "";
  if (completedLate) {
    const diffSeconds = Math.floor(
      (new Date(updatedAt).getTime() -
        new Date(String(deadline)).getTime()) /
        1000,
    );
    const withinSixHours = diffSeconds < 6 * 60 * 60;
    completedClasses = withinSixHours
      ? "border-yellow-500/40"
      : "border-orange-500/30";
  }

  return `${overdueClasses} ${completedClasses}`.trim();
}
