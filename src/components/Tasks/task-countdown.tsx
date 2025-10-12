"use client";
import { useEffect, useMemo, useState } from "react";

import {
  calculateTimeRemaining,
  formatTimeRemaining,
  calculateLateBy,
  calculateEarlyBy,
} from "./utils";

type TaskStatus = "active" | "not_active" | "completed";

interface TaskCountdownProps {
  deadline: Date | string | null;
  status: TaskStatus;
  updatedAt: Date | string;
}

export default function TaskCountdown({
  deadline,
  status,
  updatedAt,
}: TaskCountdownProps) {
  const deadlineMs = useMemo(
    () => (deadline ? new Date(deadline).getTime() : null),
    [deadline],
  );
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineMs || status === "completed") return;
    setSecondsLeft(Math.floor((deadlineMs - Date.now()) / 1000));
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs, status]);

  // Completed tasks: show early/late summary only
  if (status === "completed" && deadline) {
    const completedAt = new Date(updatedAt);
    const deadlineDate = new Date(deadline);
    const lateBy = calculateLateBy(deadlineDate, completedAt);
    const label = lateBy
      ? `${lateBy} late`
      : `${calculateEarlyBy(deadlineDate, completedAt)} early`;

    // Yellow if late within 1 day, otherwise orange; green if early/on time
    let classes = "bg-green-500/10 text-green-500";
    if (lateBy) {
      const diffSeconds = Math.floor(
        (completedAt.getTime() - deadlineDate.getTime()) / 1000,
      );
      const withinSixHrs = diffSeconds < 6 * 60 * 60;
      classes = withinSixHrs
        ? "bg-yellow-500/10 text-yellow-500"
        : "bg-orange-500/10 text-orange-500";
    }

    return (
      <div
        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${classes}`}
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        {label}
      </div>
    );
  }

  // If no deadline, render nothing
  if (!deadlineMs) return null;

  // Active/not_active tasks: live countdown
  if (secondsLeft === null) return null;
  const timeRemaining = calculateTimeRemaining(secondsLeft * 1000);
  const base = formatTimeRemaining(timeRemaining);
  const isOverdue = secondsLeft < 0;
  const label = isOverdue ? `-${base}` : base;
  const overdueWithinSixHours =
    isOverdue && Math.abs(secondsLeft) < 6 * 60 * 60;

  return (
    <div
      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${
        isOverdue
          ? overdueWithinSixHours
            ? "bg-orange-500/10 text-orange-500" // overdue < 6h → orange
            : "bg-red-500/10 text-red-500" // overdue >= 6h → red
          : secondsLeft < 6 * 60 * 60
            ? "bg-yellow-500/10 text-yellow-500" // near due < 6h → yellow
            : "bg-green-500/10 text-green-500"
      }`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {label}
    </div>
  );
}
