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
      return;
    }

    const interval = setInterval(() => {
      setTotalSeconds(totalSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, sessionIsActive]);

  return (
    <div className="flex flex-col items-center justify-center text-sm sm:text-base py-1">
      <span className="font-semibold">
        {convertSecondsToTime(totalSeconds)}
      </span>
    </div>
  );
}
