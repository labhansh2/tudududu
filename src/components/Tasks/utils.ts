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
