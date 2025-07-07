import { Activity, WorkTimeData } from "@/types";

// Custom theme for activity calendar
export const customTheme = {
  light: [
    "#f3f4f6", // Level 0 - Light gray (similar to --completed-task)
    "#e5f9f3", // Level 1 - Extra light green
    "#d1fae5", // Level 2 - Very light green
    "#a7f3d0", // Level 3 - Light green
    "#6ee7b7", // Level 4 - Medium green
    "#34d399", // Level 5 - Slightly deeper green
    "#10b981", // Level 6 - App accent color (--success)
    "#059669", // Level 7 - Deep accent green
  ],
  dark: [
    "#262626", // Level 0 - Dark gray (similar to --completed-task dark)
    "#1b2a24", // Level 1 - Extra dark green
    "#064e3b", // Level 2 - Very dark green (similar to --active-task dark)
    "#065f46", // Level 3 - Dark green
    "#047857", // Level 4 - Medium dark green
    "#059669", // Level 5 - App accent color dark (--accent)
    "#10b981", // Level 6 - Lighter accent green
    "#34d399", // Level 7 - Bright green
  ],
};

export function getLevel(totalSeconds: number) {
  if (totalSeconds >= 46800) return 7; // 13+ hours
  if (totalSeconds >= 39600) return 6; // 11+ hours
  if (totalSeconds >= 32400) return 5; // 9+ hour
  if (totalSeconds >= 25200) return 4; // 7+ hours
  if (totalSeconds >= 18000) return 3; // 5+ hours
  if (totalSeconds >= 10800) return 2; // 3+ hours
  if (totalSeconds >= 3600) return 1; // 1+ hours
  return 0;
}

// Main function: Gets dates based on selected year logic
export function getDateRange(
  selectedYear: number,
  currentYear: number,
  timezone: string,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  if (selectedYear == currentYear) {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return {
      startDate: formatter.format(oneYearAgo),
      endDate: formatter.format(today),
    };
  } else {
    const firstDay = new Date(selectedYear, 0, 1);
    const lastDay = new Date(selectedYear, 11, 31);

    return {
      startDate: formatter.format(firstDay),
      endDate: formatter.format(lastDay),
    };
  }
}

export function convertSecondsToTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}
