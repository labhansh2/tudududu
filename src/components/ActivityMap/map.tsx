"use client";

import { useEffect, useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";

interface ActivityMapProps {
  activityData: any[];
  customTheme: any;
  autoScrollToRecent?: boolean;
}

export default function ActivityMap({
  activityData,
  customTheme,
  autoScrollToRecent = true,
}: ActivityMapProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  const scrollToRecent = () => {
    if (calendarRef.current) {
      // Target the specific scrollable container used by react-activity-calendar
      const scrollContainer = calendarRef.current.querySelector(
        ".react-activity-calendar__scroll-container",
      ) as HTMLElement;

      if (
        scrollContainer &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth
      ) {
        // Scroll to the rightmost position (most recent dates)
        scrollContainer.scrollLeft =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;
      }
    }
  };

  useEffect(() => {
    if (!autoScrollToRecent) return;

    // Auto-scroll to recent dates after component mounts
    const timer = setTimeout(() => {
      scrollToRecent();

      // Enable smooth scrolling after initial positioning
      if (calendarRef.current) {
        const scrollContainer = calendarRef.current.querySelector(
          ".react-activity-calendar__scroll-container",
        ) as HTMLElement;
        if (scrollContainer) {
          scrollContainer.style.scrollBehavior = "smooth";
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [activityData, autoScrollToRecent]);

  return (
    <div className="relative">
      <div
        ref={calendarRef}
        className="rounded-lg p-4 bg-[var(--card-bg)] overflow-x-auto"
        style={{
          // Disable smooth scrolling initially to allow instant positioning
          scrollBehavior: "auto",
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex justify-center">
          <ActivityCalendar
            data={activityData}
            maxLevel={7}
            theme={customTheme}
            style={{
              color: "var(--foreground)",
            }}
            blockSize={13}
            blockMargin={3}
            blockRadius={3}
            fontSize={11}
            hideTotalCount={true}
          />
        </div>
      </div>
    </div>
  );
}
