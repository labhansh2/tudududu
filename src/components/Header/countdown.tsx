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
      <div className="flex items-center gap-3">
        <div className="font-mono text-lg sm:text-xl font-semibold text-[var(--foreground)]">
          {convertSecondsToTimeWithDays(timeLeft, !isMobile)}
        </div>
        <span className="hidden sm:block text-[var(--secondary)] text-sm">
          to go
        </span>
      </div>
    </>
  );
}
