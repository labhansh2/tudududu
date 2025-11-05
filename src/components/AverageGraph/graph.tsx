"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { HourlyData, ViewMode } from "./types";

interface HourlyGraphProps {
  data: HourlyData[];
  viewMode: ViewMode;
}

export default function HourlyGraph({ data, viewMode }: HourlyGraphProps) {
  // Format hour for display (0 -> 12am, 13 -> 1pm, etc.)
  const formatHour = (hour: number) => {
    if (hour === 0) return "12am";
    if (hour === 12) return "12pm";
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  // Format day of week (0 = Sunday, 6 = Saturday)
  const formatDayOfWeek = (day: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day] || "";
  };

  // Choose formatter based on view mode
  const formatXAxis = (value: number) => {
    return viewMode === ViewMode.WEEK
      ? formatDayOfWeek(value)
      : formatHour(value);
  };

  // Get appropriate ticks for x-axis
  const getXAxisTicks = () => {
    if (viewMode === ViewMode.WEEK) {
      return [0, 1, 2, 3, 4, 5, 6]; // All days of week
    }
    return [0, 6, 12, 18, 23]; // Selected hours
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--accent)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--accent)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.3}
        />
        <XAxis
          dataKey="hour"
          tickFormatter={formatXAxis}
          stroke="var(--secondary)"
          tick={{ fill: "var(--secondary)", fontSize: 12 }}
          ticks={getXAxisTicks()}
        />
        <YAxis hide />
        <Area
          type="monotone"
          dataKey="avgMinutes"
          stroke="var(--accent)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorAvg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
