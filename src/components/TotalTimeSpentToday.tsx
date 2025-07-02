"use client";
import { DateTime } from "luxon";
import { useState, useEffect } from "react";

function convertSecondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

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
      ? Math.floor((currentTime - activeSessionStartedAt.getTime()) / 1000)
      : 0);
      
  return (
    <div className="flex flex-col items-center justify-center text-sm sm:text-base py-1">
      <span className="font-semibold">
        {convertSecondsToTime(totalSecondsCalc)}
      </span>
    </div>
  );
}
