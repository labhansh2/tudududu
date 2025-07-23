import { getDateRangeForView, getTimeLineLayoutStyles } from "./utils";
import { getTimelineSessions, getTimelineStats } from "./actions";
import {
  TimelineDataProvider,
  TimelineDateProvider,
  TimelineViewProvider,
  SessionTooltipProvider,
} from "./context";
import { View } from "./types";

import TimelineHeader from "./header";
import TimelineGrid from "./grid";
import SessionTooltip from "./session-tooltip";

interface TimelineProps {
  isFullHeight: boolean;
  isFullPage: boolean;
  viewMode: View;
  paramsDateUserTz: string;
  timezone: string;
}

export default async function Timeline({
  isFullHeight,
  isFullPage,
  viewMode,
  paramsDateUserTz,
  timezone,
}: TimelineProps) {
  const { startDate, endDate } = getDateRangeForView(
    paramsDateUserTz,
    timezone,
    viewMode,
  );

  console.log("START from index :", startDate);
  console.log("END from index :", endDate);

  console.log("ReferenceDate: ", paramsDateUserTz);
  console.log("View: ", viewMode);

  const sessionsData = await getTimelineSessions(startDate, endDate);
  const stats = await getTimelineStats(startDate, endDate);

  console.log("Data: ", sessionsData);

  return (
    <TimelineDataProvider sessionsData={sessionsData} statsData={stats}>
      <TimelineDateProvider
        referenceDate={paramsDateUserTz}
        timezone={timezone}
        dateRange={{ startDate, endDate }}
        view={viewMode}
      >
        <SessionTooltipProvider>
          <TimelineViewProvider
            isFullHeight={isFullHeight}
            isFullPage={isFullPage}
          >
            <div
              className={getTimeLineLayoutStyles(isFullPage, isFullHeight)}
            >
              <TimelineHeader />
              <TimelineGrid />
              <SessionTooltip />
            </div>
          </TimelineViewProvider>
        </SessionTooltipProvider>
      </TimelineDateProvider>
    </TimelineDataProvider>
  );
}
