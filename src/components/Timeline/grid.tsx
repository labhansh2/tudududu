import { useTimeline } from "./context";
import { TimelineSession } from "./actions";
import {
  TaskGroup,
  getSessionPosition,
  formatDuration,
  getStatusColor,
} from "./utils";

export default function TimelineGrid() {
  const { taskGroups, isFullHeight } = useTimeline();

  return (
    <div
      className={`space-y-4 overflow-x-auto ${
        isFullHeight
          ? "h-full flex flex-col"
          : "h-full flex flex-col overflow-y-auto"
      }`}
    >
      <div
        className={`min-w-[600px] sm:min-w-0 space-y-4 ${
          isFullHeight
            ? "flex flex-col h-full"
            : "flex flex-col h-full overflow-y-auto"
        }`}
      >
        <TimeLabels />

        {/* Timeline grid with task rows */}
        <div
          className={`relative ${
            isFullHeight
              ? "flex-1 min-h-0"
              : "flex-1 min-h-0 overflow-y-auto"
          }`}
        >
          <GridLines />

          {/* Task rows - scrollable when in full height mode */}
          <div
            className={`space-y-1 ${
              isFullHeight
                ? "overflow-y-auto h-full pr-2"
                : "overflow-y-auto h-full pr-2"
            }`}
          >
            {taskGroups.map((taskGroup) => (
              <TaskRow key={taskGroup.taskId} taskGroup={taskGroup} />
            ))}

            {/* Add some bottom padding when scrollable */}
            {isFullHeight && <div className="h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskRowProps {
  taskGroup: TaskGroup;
}

function TaskRow({ taskGroup }: TaskRowProps) {
  console.log("TASK GROUP", taskGroup);
  return (
    <div className="space-y-0.5">
      <div className="relative">
        <div
          className={`text-xs text-[var(--secondary)] font-medium px-1}`}
        >
          {taskGroup.taskName}
        </div>
      </div>

      {/* Sessions row */}
      <div className="relative h-12 sm:h-12 bg-[var(--card-bg)] rounded border border-[var(--border)]">
        {/* Sessions */}
        {taskGroup.sessions.map((session: TimelineSession) => (
          <SessionBar key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}

interface SessionBarProps {
  session: TimelineSession;
}

function SessionBar({ session }: SessionBarProps) {
  const {
    timeRange,
    viewMode,
    isMobile,
    clickedSession,
    handleSessionHover,
    handleSessionLeave,
    handleSessionClick,
    currentTime,
  } = useTimeline();
  // For active sessions (no endedAt), use currentTime as the end time
  const effectiveSession = session.endedAt
    ? session
    : { ...session, endedAt: currentTime };

  const position = getSessionPosition(
    effectiveSession,
    timeRange,
    viewMode,
  );
  const statusColor = getStatusColor(session.taskStatus);

  // Add pulsing animation for active sessions
  const isActive = !session.endedAt;

  return (
    <div
      className={`absolute top-1 bottom-1 ${statusColor} rounded cursor-pointer transition-all hover:brightness-110 z-20 min-w-[8px] ${
        isMobile && clickedSession?.sessionId === session.sessionId
          ? "ring-2 ring-[var(--accent)] ring-opacity-50"
          : ""
      } ${isActive ? "shadow-lg animate-pulse" : ""}`}
      style={position}
      onMouseEnter={(e) => {
        if (!isMobile) {
          const rect = e.currentTarget.getBoundingClientRect();
          handleSessionHover(session, rect);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          handleSessionLeave();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isMobile) {
          const rect = e.currentTarget.getBoundingClientRect();
          handleSessionClick(session, rect);
        }
      }}
    >
      {/* Session content - only show text if wide enough */}
      <div className="h-full flex items-center justify-center text-xs font-medium text-white px-1 sm:px-2 overflow-hidden">
        {position.width && parseFloat(position.width) > 8 && (
          <span className="truncate">
            {formatDuration(
              session.startedAt,
              session.endedAt || currentTime,
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function TimeLabels() {
  const { viewMode, timeRange, isFullHeight } = useTimeline();
  if (viewMode === "day") {
    return (
      <div className={isFullHeight ? "flex-shrink-0" : ""}>
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {timeRange.hours?.map((hour, index) => (
            <div key={hour} className="flex-1">
              <span
                className={`${index % 2 === 0 ? "block" : "hidden md:block"}`}
              >
                {hour === 0
                  ? "12AM"
                  : hour < 12
                    ? `${hour}AM`
                    : hour === 12
                      ? "12PM"
                      : `${hour - 12}PM`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (viewMode === "week") {
    return (
      <div className={isFullHeight ? "flex-shrink-0" : ""}>
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {timeRange.days?.map((day) => (
            <div
              key={day.toISOString()}
              className="flex-1 text-center px-1"
            >
              <div className="hidden sm:block">
                {day.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "numeric",
                  day: "numeric",
                })}
              </div>
              <div className="sm:hidden">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    const weeks: number[] = [];
    if (timeRange.days) {
      for (
        let week = 0;
        week < Math.ceil(timeRange.days.length / 7);
        week++
      ) {
        weeks.push(week);
      }
    }
    return (
      <div className={isFullHeight ? "flex-shrink-0" : ""}>
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {weeks.map((week) => (
            <div key={week} className="flex-1 text-center">
              <div className="hidden sm:block">Week {week + 1}</div>
              <div className="sm:hidden">W{week + 1}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function GridLines() {
  const { viewMode, timeRange } = useTimeline();
  return (
    <div className="absolute inset-0 flex">
      {(viewMode === "day"
        ? timeRange.hours
        : viewMode === "week"
          ? timeRange.days
          : Array.from({ length: 4 }, (_, i) => i)
      )?.map((_, index) => (
        <div
          key={index}
          className="flex-1 border-l border-[var(--border)] first:border-l-0"
        />
      ))}
    </div>
  );
}
