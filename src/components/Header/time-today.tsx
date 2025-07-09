"use client";
import { useState, useEffect } from "react";

import { convertSecondsToTime } from "./utils";

export default function TotalTimeSpentToday({
  totalSeconds,
  activeSessionStartedAt,
}: {
  totalSeconds: number;
  activeSessionStartedAt: Date | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Pure calculation based on state
  const totalSecondsCalc =
    totalSeconds +
    (activeSessionStartedAt
      ? Math.floor(
          (currentTime - new Date(activeSessionStartedAt).getTime()) /
            1000,
        )
      : 0);

  return (
    <div className="flex flex-col items-center justify-center text-sm sm:text-base py-1">
      <span className="font-semibold">
        {convertSecondsToTime(totalSecondsCalc)}
      </span>
    </div>
  );
}
