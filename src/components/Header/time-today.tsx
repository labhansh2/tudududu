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
    <div className="flex flex-col items-center justify-center text-sm sm:text-base py-1">
      <span className="font-semibold">
        {convertSecondsToTime(totalSeconds)}
      </span>
    </div>
  );
}
