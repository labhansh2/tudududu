"use client";
import { useEffect, useState } from "react";

import { useMobile } from "@/hooks/useMobile";

import { convertSecondsToTimeWithDays } from "./utils";

export default function Countdown({
  secondsLeft,
}: {
  secondsLeft: number;
}) {
  const [timeLeft, setTimeLeft] = useState(secondsLeft);

  const isMobile = useMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <>
      <div
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-[var(--border-radius)] bg-[var(--bg-lighter)] min-w-0"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="font-mono text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
          {convertSecondsToTimeWithDays(timeLeft, !isMobile)}
        </div>
        <span className="hidden sm:block text-[var(--secondary)] text-xs sm:text-sm font-semibold whitespace-nowrap">
          to go
        </span>
      </div>
    </>
  );
}
