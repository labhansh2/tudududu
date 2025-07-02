'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Session {
  sessionId: string;
  taskId: string;
  taskName: string;
  taskStatus: 'completed' | 'active' | 'not_active';
  startedAt: Date;
  endedAt: Date | null; // null for active sessions
}

interface TaskGroup {
  taskId: string;
  taskName: string;
  sessions: Session[];
  lastActivity: Date;
}

interface TimeRange {
  start: Date;
  end: Date;
  hours?: number[];
  days?: Date[];
}

const SessionTimeline = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [hoveredSession, setHoveredSession] = useState<Session | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickedSession, setClickedSession] = useState<Session | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close clicked session when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobile && clickedSession) {
        setClickedSession(null);
        setHoveredPosition(null);
      }
    };
    
    if (isMobile) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, clickedSession]);



  // Dummy data matching your interface
  const sessionsData: Session[] = [
    {
      sessionId: '1',
      taskId: 'task-1',
      taskName: 'Frontend Development',
      taskStatus: 'completed',
      startedAt: new Date('2025-07-01T09:00:00'),
      endedAt: new Date('2025-07-01T11:30:00')
    },
    {
      sessionId: '2',
      taskId: 'task-1',
      taskName: 'Frontend Development',
      taskStatus: 'completed',
      startedAt: new Date('2025-07-01T14:00:00'),
      endedAt: new Date('2025-07-01T16:15:00')
    },
    {
      sessionId: '3',
      taskId: 'task-2',
      taskName: 'API Integration',
      taskStatus: 'completed',
      startedAt: new Date('2025-07-01T11:45:00'),
      endedAt: new Date('2025-07-01T13:30:00')
    },
    {
      sessionId: '4',
      taskId: 'task-3',
      taskName: 'Database Design',
      taskStatus: 'active',
      startedAt: new Date('2025-07-01T16:30:00'),
      endedAt: null // Active session - ongoing
    },
    {
      sessionId: '5',
      taskId: 'task-1',
      taskName: 'Frontend Development',
      taskStatus: 'completed',
      startedAt: new Date('2025-06-30T10:00:00'),
      endedAt: new Date('2025-06-30T12:00:00')
    },
    {
      sessionId: '6',
      taskId: 'task-2',
      taskName: 'API Integration',
      taskStatus: 'not_active',
      startedAt: new Date('2025-06-30T13:00:00'),
      endedAt: new Date('2025-06-30T15:30:00')
    },
    {
      sessionId: '7',
      taskId: 'task-4',
      taskName: 'Testing & QA',
      taskStatus: 'not_active',
      startedAt: new Date('2025-06-29T09:30:00'),
      endedAt: new Date('2025-06-29T11:00:00')
    },
    {
      sessionId: '8',
      taskId: 'task-3',
      taskName: 'Database Design',
      taskStatus: 'completed',
      startedAt: new Date('2025-06-29T14:00:00'),
      endedAt: new Date('2025-06-29T17:00:00')
    },
    {
      sessionId: '9',
      taskId: 'task-1',
      taskName: 'Frontend Development',
      taskStatus: 'completed',
      startedAt: new Date('2025-06-28T08:00:00'),
      endedAt: new Date('2025-06-28T10:30:00')
    },
    {
      sessionId: '10',
      taskId: 'task-5',
      taskName: 'Code Review',
      taskStatus: 'completed',
      startedAt: new Date('2025-06-28T11:00:00'),
      endedAt: new Date('2025-06-29T03:30:00')
    }
  ];

  const getTimeRange = (): TimeRange => {
    const baseDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    switch (viewMode) {
      case 'day':
        return {
          start: baseDate,
          end: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
          hours: Array.from({ length: 24 }, (_, i) => i)
        };
      case 'week':
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() - baseDate.getDay());
        return {
          start: weekStart,
          end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
          days: Array.from({ length: 7 }, (_, i) => {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            return day;
          })
        };
      case 'month':
        const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        return {
          start: monthStart,
          end: new Date(monthStart.getTime() + (monthEnd.getDate()) * 24 * 60 * 60 * 1000),
          days: Array.from({ length: monthEnd.getDate() }, (_, i) => {
            const day = new Date(monthStart);
            day.setDate(i + 1);
            return day;
          })
        };
      default:
        return { start: baseDate, end: baseDate };
    }
  };

  const navigateTime = (direction: 'next' | 'prev') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getDateRangeLabel = () => {
    const range = getTimeRange();
    
    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekEnd = new Date(range.end.getTime() - 24 * 60 * 60 * 1000);
        return `${range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return '';
    }
  };

  const timeRange = getTimeRange();

  // Real-time updates for active sessions
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update active session positions every minute
      setCurrentDate(prev => new Date(prev.getTime() + 1));
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = useMemo(() => {
    return sessionsData.filter(session => {
      const sessionEnd = session.endedAt || new Date(); // Use current time for active sessions
      return session.startedAt < timeRange.end && sessionEnd > timeRange.start;
    });
  }, [viewMode, timeRange, currentDate]);

  const taskGroups = useMemo(() => {
    const groups: Record<string, TaskGroup> = {};
    filteredSessions.forEach(session => {
      if (!groups[session.taskId]) {
        groups[session.taskId] = {
          taskId: session.taskId,
          taskName: session.taskName,
          sessions: [],
          lastActivity: session.startedAt
        };
      }
      groups[session.taskId].sessions.push(session);
      const sessionEnd = session.endedAt || new Date();
      if (sessionEnd > groups[session.taskId].lastActivity) {
        groups[session.taskId].lastActivity = sessionEnd;
      }
    });

    return Object.values(groups).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }, [filteredSessions]);

  const getSessionPosition = (session: Session) => {
    const rangeStart = timeRange.start.getTime();
    const rangeEnd = timeRange.end.getTime();
    const sessionStart = session.startedAt.getTime();
    const sessionEnd = session.endedAt ? session.endedAt.getTime() : new Date().getTime(); // Use current time for active sessions
    
    // Clip session to visible time range
    const visibleStart = Math.max(sessionStart, rangeStart);
    const visibleEnd = Math.min(sessionEnd, rangeEnd);
    
    if (viewMode === 'day') {
      const left = ((visibleStart - rangeStart) / (24 * 60 * 60 * 1000)) * 100;
      const width = ((visibleEnd - visibleStart) / (24 * 60 * 60 * 1000)) * 100;
      return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
    } else {
      const left = ((visibleStart - rangeStart) / (rangeEnd - rangeStart)) * 100;
      const width = ((visibleEnd - visibleStart) / (rangeEnd - rangeStart)) * 100;
      return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
    }
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(duration / 60);
    const minutes = Math.floor(duration % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: Session['taskStatus']) => {
    switch (status) {
      case 'completed': return 'bg-[var(--secondary)]'; // Gray for completed
      case 'active': return 'bg-[var(--accent)]'; // Main accent color for active
      case 'not_active': return 'bg-[var(--success)]'; // Green for not active
      default: return 'bg-[var(--secondary)]';
    }
  };

  const renderTimeLabels = () => {
    if (viewMode === 'day') {
      return (
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {timeRange.hours?.map((hour, index) => (
            <div key={hour} className="flex-1 text-center">
              {/* Show fewer labels on mobile */}
              <span className={`${index % 2 === 0 ? 'block' : 'hidden sm:block'}`}>
                {hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
              </span>
            </div>
          ))}
        </div>
      );
    } else if (viewMode === 'week') {
      return (
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {timeRange.days?.map(day => (
            <div key={day.toISOString()} className="flex-1 text-center px-1">
              <div className="hidden sm:block">
                {day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </div>
              <div className="sm:hidden">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      const weeks: number[] = [];
      const firstDay = timeRange.days?.[0];
      const lastDay = timeRange.days?.[timeRange.days.length - 1];
      if (timeRange.days) {
        for (let week = 0; week < Math.ceil(timeRange.days.length / 7); week++) {
          weeks.push(week);
        }
      }
      return (
        <div className="flex text-xs text-[var(--secondary)] mb-2">
          {weeks.map(week => (
            <div key={week} className="flex-1 text-center">
              <div className="hidden sm:block">Week {week + 1}</div>
              <div className="sm:hidden">W{week + 1}</div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full bg-[var(--card-bg)] text-[var(--foreground)] p-4 sm:p-6 rounded-lg border border-[var(--border)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          {/* <h3 className="text-lg font-medium mb-1">Session Timeline</h3> */}
          {/* <p className="text-sm text-[var(--secondary)]">
            worked 47 hrs • average 7 hrs per day
          </p> */}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTime('prev')}
              className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-sm font-medium min-w-[140px] sm:min-w-[200px] text-center px-2">
              {getDateRangeLabel()}
            </div>
            
            <button
              onClick={() => navigateTime('next')}
              className="p-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--active-task)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          {/* View Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-between gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--active-task)] transition-colors w-full sm:w-auto min-w-[80px]"
            >
              <span className="capitalize">{viewMode}</span>
              <ChevronDown size={16} />
            </button>
            
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-40 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[80px]">
                  {(['day', 'week', 'month'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setViewMode(mode);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--active-task)] transition-colors capitalize ${
                        viewMode === mode ? 'text-[var(--accent)] bg-[var(--active-task)]' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-0 space-y-4">
          {/* Time labels */}
          {renderTimeLabels()}

          {/* Timeline grid */}
          <div className="relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {(viewMode === 'day' ? timeRange.hours : viewMode === 'week' ? timeRange.days : Array.from({ length: 4 }, (_, i) => i))?.map((_, index) => (
                <div key={index} className="flex-1 border-l border-[var(--border)] first:border-l-0" />
              ))}
            </div>

            {/* Task rows */}
            <div className="space-y-3">
              {taskGroups.map((taskGroup, index) => (
                <div key={taskGroup.taskId} className="relative h-12 sm:h-12 bg-[var(--card-bg)] rounded border border-[var(--border)]">
                  {/* Task label */}
                  <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-xs text-[var(--secondary)] font-medium z-10 max-w-[120px] sm:max-w-none truncate">
                    {taskGroup.taskName}
                  </div>

                  {/* Sessions */}
                  {taskGroup.sessions.map((session: Session) => {
                    const position = getSessionPosition(session);
                    return (
                      <div
                        key={session.sessionId}
                        className={`absolute top-1 bottom-1 ${getStatusColor(session.taskStatus)} rounded cursor-pointer transition-all hover:brightness-110 z-20 min-w-[8px] ${
                          isMobile && clickedSession?.sessionId === session.sessionId ? 'ring-2 ring-[var(--accent)] ring-opacity-50' : ''
                        }`}
                        style={position}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            setHoveredSession(session);
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredPosition({ 
                              x: rect.left + rect.width / 2, 
                              y: rect.top 
                            });
                          }
                        }}
                        onMouseLeave={() => {
                          if (!isMobile) {
                            setHoveredSession(null);
                            setHoveredPosition(null);
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMobile) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            if (clickedSession?.sessionId === session.sessionId) {
                              // Close if clicking the same session
                              setClickedSession(null);
                              setHoveredPosition(null);
                            } else {
                              // Open new session
                              setClickedSession(session);
                              setHoveredSession(session);
                              setHoveredPosition({ 
                                x: rect.left + rect.width / 2, 
                                y: rect.top 
                              });
                            }
                          }
                        }}
                      >
                        {/* Session content - only show text if wide enough */}
                        <div className="h-full flex items-center justify-center text-xs font-medium text-white px-1 sm:px-2 overflow-hidden">
                          {position.width && parseFloat(position.width) > 8 && (
                            <span className="truncate">
                              {formatDuration(session.startedAt, session.endedAt || new Date())}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSession && hoveredPosition && (!isMobile || clickedSession) && (
        <div 
          className="fixed z-50 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-3 shadow-lg pointer-events-none max-w-xs"
          style={{ 
            left: `${hoveredPosition.x}px`, 
            top: `${Math.max(16, hoveredPosition.y - 10)}px`, 
            transform: (() => {
              const tooltipWidth = 288; // max-w-xs = 20rem = 320px, but content is usually smaller
              const rightEdge = hoveredPosition.x + tooltipWidth / 2;
              const leftEdge = hoveredPosition.x - tooltipWidth / 2;
              
              if (rightEdge > window.innerWidth - 16) {
                // Too close to right edge - align tooltip right edge with screen
                return 'translate(-100%, -100%)';
              } else if (leftEdge < 16) {
                // Too close to left edge - align tooltip left edge with screen  
                return 'translate(0%, -100%)';
              } else {
                // Enough space on both sides - center the tooltip
                return 'translate(-50%, -100%)';
              }
            })()
          }}>
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">
            {hoveredSession.taskName}
          </div>
                      <div className="text-xs text-[var(--secondary)] space-y-1">
              <div className="break-words">
                {hoveredSession.startedAt.toLocaleDateString()} • {hoveredSession.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {hoveredSession.endedAt ? hoveredSession.endedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ongoing'}
              </div>
              <div>
                Duration: {formatDuration(hoveredSession.startedAt, hoveredSession.endedAt || new Date())}
              </div>
                          <div className="capitalize">
                <span className={`px-2 py-1 rounded text-xs text-white ${
                  hoveredSession.taskStatus === 'completed' ? 'bg-[var(--secondary)]' :
                  hoveredSession.taskStatus === 'active' ? 'bg-[var(--accent)]' : 'bg-[var(--success)]'
                }`}>
                  {hoveredSession.taskStatus === 'active' && !hoveredSession.endedAt ? 'ongoing' : hoveredSession.taskStatus.replace('_', ' ')}
                </span>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimeline;