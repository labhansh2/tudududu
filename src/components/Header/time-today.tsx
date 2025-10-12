"use client";
import { useState, useEffect } from "react";

import { convertSecondsToTime } from "./utils";

export default function TotalTimeSpentToday({
  initialTotalSeconds,
  sessionIsActive,
}: {
  initialTotalSeconds: number;
  sessionIsActive: boolean;
}) {
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);

  useEffect(() => {
    if (!sessionIsActive) {
      setTotalSeconds(initialTotalSeconds);
      return;
    }

    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionIsActive, initialTotalSeconds]);

  return (
    <div 
      className="flex flex-col items-center justify-center text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-[var(--border-radius)] bg-[var(--bg-lighter)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <span className="font-mono font-bold text-[var(--success)] whitespace-nowrap">
        {convertSecondsToTime(totalSeconds)}
      </span>
    </div>
  );
}
