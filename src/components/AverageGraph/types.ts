export interface HourlyData {
  hour: number;
  avgMinutes: number;
  totalSessions: number;
}

export enum DateRange {
  WEEK = "7",
  MONTH = "30",
  QUARTER = "90",
  YEAR = "365",
}

export enum ViewMode {
  DAY = "day",
  WEEK = "week",
}

export interface HourlyActivityData {
  data: HourlyData[];
  totalHours: number;
  peakHour: number;
  dateRange: DateRange;
  viewMode: ViewMode;
}

export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
}
