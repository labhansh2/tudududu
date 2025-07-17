import { getTimelineSessions, getTimelineStats } from "./actions";
import { getDateRangeForView } from "./utils";
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
  const { startDate, endDate } = getDateRangeForView(
    new Date(paramsDateUserTz),
    viewMode,
  );

  console.log("START DATE", startDate);
  console.log("END DATE", endDate);

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
