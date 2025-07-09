import SessionTimeline from "./timeline";
import { getTimelineSessions } from "./actions";
import { getDateRangeForView } from "./utils";

interface TimelineProps {
  viewMode: "day" | "week" | "month";
  currentDate: string;
}

export default async function Timeline({
  viewMode = "week",
  currentDate,
  isFullHeight = false,
  isFullPage = true,
}: {
  viewMode: "day" | "week" | "month";
  currentDate: string;
  isFullHeight?: boolean;
  isFullPage?: boolean;
}) {
  const parsedDate = new Date(currentDate);

  const { startDate, endDate } = getDateRangeForView(parsedDate, viewMode);

  const sessionsData = await getTimelineSessions(startDate, endDate);

  return (
    <SessionTimeline
      sessionsData={sessionsData}
      initialViewMode={viewMode}
      initialCurrentDate={currentDate}
      isFullHeight={isFullHeight}
      isFullPage={isFullPage}
    />
  );
}
