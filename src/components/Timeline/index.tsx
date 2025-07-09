import { getTimelineSessions, getTimelineStats } from "./actions";
import { getDateRangeForView, parseLocalDate } from "./utils";

import SessionTimeline from "./timeline";

interface TimelineProps {
  viewMode: "day" | "week" | "month";
  currentDate: string;
  isFullHeight?: boolean;
  isFullPage?: boolean;
}

export default async function Timeline({
  viewMode = "week",
  currentDate,
  isFullHeight = false,
  isFullPage = true,
}: TimelineProps) {
  const parsedDate = parseLocalDate(currentDate);

  const { startDate, endDate } = getDateRangeForView(parsedDate, viewMode);

  const sessionsData = await getTimelineSessions(startDate, endDate);

  const stats = await getTimelineStats(startDate, endDate);

  return (
    <SessionTimeline
      sessionsData={sessionsData}
      stats={stats}
      initialViewMode={viewMode}
      initialCurrentDate={currentDate}
      isFullHeight={isFullHeight}
      isFullPage={isFullPage}
    />
  );
}
