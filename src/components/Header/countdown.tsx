"use client";
import { useCountdown } from "@/components/Header/use-countdown";

export default function Countdown({ deadline }: { deadline: Date }) {
  const timeLeft = useCountdown(deadline);

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="font-mono text-lg sm:text-xl font-semibold text-[var(--foreground)]">
          {timeLeft.days}d {formatTime(timeLeft.hours)}h{" "}
          {formatTime(timeLeft.minutes)}m
        </div>
        <span className="hidden sm:block text-[var(--secondary)] text-sm">
          to go
        </span>
      </div>
    </>
  );
}
