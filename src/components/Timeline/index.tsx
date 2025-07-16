import { getTimelineSessions, getTimelineStats } from "./actions";
import { getDateRangeForView, parseLocalDate } from "./utils";
import { TimelineProvider } from "./context";
import SessionTimeline from "./timeline";

interface TimelineProps {
  viewMode: "day" | "week" | "month";
  paramsDateUserTz: string;
  isFullHeight?: boolean;
  isFullPage?: boolean;
}

export default async function Timeline({
  viewMode = "week",
  paramsDateUserTz,
  isFullHeight = false,
  isFullPage = true,
}: TimelineProps) {
  const parsedDate = parseLocalDate(
    new Date().toLocaleDateString("en-CA"),
  );

  const { startDate, endDate } = getDateRangeForView(parsedDate, viewMode);
  const sessionsData = await getTimelineSessions(startDate, endDate);
  const stats = await getTimelineStats(startDate, endDate);

  return (
    <TimelineProvider
      sessionsData={sessionsData}
      stats={stats}
      initialViewMode={viewMode}
      initialCurrentDate={paramsDateUserTz}
      isFullHeight={isFullHeight}
      isFullPage={isFullPage}
    >
      <SessionTimeline />
    </TimelineProvider>
  );
}
