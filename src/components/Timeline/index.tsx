import SessionTimeline from "./timeline";
import { getTimelineSessions, getDateRangeForView } from "./actions";

interface TimelineProps {
  viewMode: "day" | "week" | "month";
  currentDate: string;
}

export default async function Timeline({
  viewMode = "week",
  currentDate,
}: TimelineProps) {
  const parsedDate = new Date(currentDate);

  const { startDate, endDate } = getDateRangeForView(parsedDate, viewMode);

  const sessionsData = await getTimelineSessions(startDate, endDate);

  return (
    <SessionTimeline
      sessionsData={sessionsData}
      initialViewMode={viewMode}
      initialCurrentDate={currentDate}
    />
  );
}
