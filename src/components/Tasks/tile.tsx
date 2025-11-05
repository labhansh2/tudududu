"use client";
import { useState, useTransition } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Check, Ellipsis } from "lucide-react";

import { useMobile } from "@/hooks/useMobile";

import { type TaskWithStatsAndSparkline } from "./actions";
import { getTaskStyles, getDeadlineBorderClasses } from "./utils";

import {
  completeTask,
  updateTaskName,
  deleteTask,
  toggleTaskStatus,
  type SparklineData,
} from "./actions";

import TaskCountdown from "./task-countdown";
import TaskDeadlineEditor from "./deadline-editor";

interface Props {
  task: TaskWithStatsAndSparkline;
  activeTask: TaskWithStatsAndSparkline | undefined;
  isDetailedView: boolean;
}

export default function TaskTile({
  task,
  activeTask,
  isDetailedView,
}: Props) {
  const [toggleIsPending, startToggleTransition] = useTransition();
  const [completeIsPending, startCompleteTransition] = useTransition();
  const [editIsPending, startEditTransition] = useTransition();

  const isMobile = useMobile();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeadlineEditor, setShowDeadlineEditor] = useState(false);

  const handleUpdateTaskName = async (editName: string) => {
    startEditTransition(async () => {
      await updateTaskName(task.id, editName);
    });
  };

  const handleDeleteTask = async () => {
    await deleteTask(task);
  };

  const handleToggleTaskStatus = async () => {
    startToggleTransition(async () => {
      await toggleTaskStatus(task.id);
    });
  };

  const handleCompleteTask = async () => {
    startCompleteTransition(async () => {
      await completeTask(task);
    });
  };

  const deadlineClasses = getDeadlineBorderClasses(
    task.status,
    task.deadline,
    task.updatedAt,
  );
  const canAddDeadline = task.status !== "completed" && !task.deadline;

  const getBackgroundColor = () => {
    if (activeTask?.id === task.id) return "var(--active-task)";
    if (task.status === "completed") return "var(--completed-task)";
    return "var(--bg-lighter)"; // Incomplete tasks - darker than completed
  };

  return (
    <div
      className={`p-2.5 sm:p-3 rounded-[var(--border-radius)] transition-shadow ${getTaskStyles(task.status)} ${deadlineClasses} ${
        activeTask?.id === task.id
          ? "ring-2 ring-[var(--accent)] ring-opacity-50"
          : ""
      }`}
      style={{
        boxShadow: "var(--shadow-sm)",
        background: getBackgroundColor(),
      }}
    >
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Working status checkbox */}
        {task.status !== "completed" && (
          <Checkbox
            checked={activeTask?.id === task.id}
            toggleIsPending={toggleIsPending}
            disabled={
              toggleIsPending ||
              completeIsPending ||
              editIsPending ||
              isEditing
            }
            handleToggleTaskStatus={handleToggleTaskStatus}
          />
        )}
        {/* Task name */}
        <TaskName
          taskName={task.name}
          completed={task.status === "completed"}
          isEditing={isEditing}
          editIsPending={editIsPending}
          setIsEditing={setIsEditing}
          onEdit={handleUpdateTaskName}
        />

        {/* Deadline countdown / status */}
        {task.deadline && (
          <div className="flex-shrink-0">
            <TaskCountdown
              deadline={task.deadline}
              status={task.status}
              updatedAt={task.updatedAt}
            />
          </div>
        )}

        {!isMobile && !isDetailedView && (
          <Sparkline sparklineData={task.sparklineData} />
        )}

        {/* Complete button */}
        <CompleteBtn
          completeIsPending={completeIsPending}
          disabled={
            toggleIsPending ||
            completeIsPending ||
            editIsPending ||
            isEditing
          }
          completed={task.status === "completed"}
          handleCompleteTask={handleCompleteTask}
        />

        {/* Options menu */}
        <Menu
          isCompleted={task.status === "completed"}
          onEditClick={() => {
            setIsEditing(true);
          }}
          canAddDeadline={canAddDeadline}
          onAddDeadlineClick={() => setShowDeadlineEditor(true)}
          onDeleteClick={handleDeleteTask}
        />
      </div>

      {/* Detailed view */}
      {isDetailedView && (
        <div
          className="mt-2 pt-2 rounded-lg bg-[var(--bg-lighter)] p-2 sm:p-2.5"
          style={{ boxShadow: "var(--shadow-inset)" }}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-2.5">
            <Stats
              totalTime={task.taskStats.total_time_spent}
              longestSession={task.taskStats.longest_session}
            />
            <div className="flex-shrink-0">
              <Sparkline sparklineData={task.sparklineData} />
            </div>
          </div>
        </div>
      )}

      {showDeadlineEditor &&
        task.status !== "completed" &&
        !task.deadline && (
          <div className="mt-2">
            <TaskDeadlineEditor
              taskId={task.id}
              defaultValue={task.deadline ?? new Date()}
              onClose={() => setShowDeadlineEditor(false)}
            />
          </div>
        )}
    </div>
  );
}

interface StatsProps {
  totalTime: number;
  longestSession: number;
}

function Stats({ totalTime, longestSession }: StatsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-center">
        <div className="text-lg font-bold text-[var(--foreground)] leading-none">
          {(totalTime / 3600).toFixed(1)}h
        </div>
        <div className="text-[10px] text-[var(--secondary)] uppercase tracking-wider mt-1 font-semibold">
          Total
        </div>
      </div>
      <div className="w-px h-8 bg-[var(--border)]"></div>
      <div className="text-center">
        <div className="text-lg font-bold text-[var(--success)] leading-none">
          {(longestSession / 3600).toFixed(1)}h
        </div>
        <div className="text-[10px] text-[var(--secondary)] uppercase tracking-wider mt-1 font-semibold">
          Best
        </div>
      </div>
    </div>
  );
}

interface SparklineProps {
  sparklineData: SparklineData[];
}

function Sparkline({ sparklineData }: SparklineProps) {
  return (
    <>
      <div className="w-20 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <YAxis hide domain={[0, 4]} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

interface CheckboxProps {
  checked: boolean;
  toggleIsPending: boolean;
  disabled: boolean;
  handleToggleTaskStatus: () => void;
}

function Checkbox({
  checked,
  toggleIsPending,
  disabled,
  handleToggleTaskStatus,
}: CheckboxProps) {
  return (
    <>
      {toggleIsPending ? (
        <div
          className="w-5 h-5 rounded flex items-center justify-center transition-all bg-[var(--accent)]"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="w-2.5 h-2.5 rounded-sm bg-white animate-ping"></div>
        </div>
      ) : (
        <button
          onClick={() => handleToggleTaskStatus()}
          disabled={disabled}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all relative ${
            checked
              ? "bg-[var(--accent)]"
              : "bg-[var(--bg-base)] hover:bg-[var(--bg-lighter)]"
          }`}
          style={
            checked
              ? {
                  boxShadow: "var(--shadow-sm)",
                }
              : {
                  boxShadow: "var(--shadow-inset)",
                }
          }
        >
          {checked && (
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          )}
        </button>
      )}
    </>
  );
}

interface TaskNameProps {
  taskName: string;
  completed: boolean;
  isEditing: boolean;
  editIsPending: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onEdit: (editName: string) => void;
}

function TaskName({
  taskName,
  completed,
  isEditing,
  editIsPending,
  setIsEditing,
  onEdit,
}: TaskNameProps) {
  const [editName, setEditName] = useState(taskName);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onEdit(editName);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(taskName);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => {
            if (editName.trim() === taskName || !editName.trim()) {
              setIsEditing(false);
              setEditName(taskName);
            } else {
              onEdit(editName.trim());
              setIsEditing(false);
            }
          }}
          onKeyUp={handleKeyPress}
          className="w-full bg-transparent border-none outline-none text-[var(--foreground)] font-medium"
          autoFocus
          disabled={editIsPending}
        />
      ) : (
        <span
          className={`block truncate font-medium ${
            completed
              ? "line-through text-[var(--secondary)]"
              : "text-[var(--foreground)]"
          }`}
        >
          {taskName}
        </span>
      )}
    </div>
  );
}

interface CompleteBtnProps {
  completeIsPending: boolean;
  disabled: boolean;
  completed: boolean;
  handleCompleteTask: () => void;
}

function CompleteBtn({
  completeIsPending,
  disabled,
  completed,
  handleCompleteTask,
}: CompleteBtnProps) {
  return (
    <>
      {completeIsPending ? (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-[var(--success)]"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
        </div>
      ) : (
        <button
          onClick={() => handleCompleteTask()}
          disabled={disabled}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            completed
              ? "bg-[var(--success)] cursor-default"
              : "bg-[var(--bg-base)] hover:bg-[var(--success)] cursor-pointer"
          }`}
          style={
            completed
              ? {
                  boxShadow: "var(--shadow-sm)",
                }
              : {
                  boxShadow: "var(--shadow-inset)",
                }
          }
        >
          {completed && (
            <Check className="w-4 h-4 text-white stroke-[3]" />
          )}
        </button>
      )}
    </>
  );
}

interface MenuProps {
  isCompleted: boolean;
  canAddDeadline: boolean;
  onEditClick: () => void;
  onAddDeadlineClick: () => void;
  onDeleteClick: () => void;
}

function Menu({
  isCompleted,
  canAddDeadline,
  onEditClick,
  onAddDeadlineClick,
  onDeleteClick,
}: MenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
          className={`w-8 h-8 flex items-center justify-center text-[var(--secondary)] hover:text-[var(--foreground)] transition-all rounded-lg flex-shrink-0 ${
            showMenu
              ? "bg-[var(--bg-lighter)]"
              : "hover:bg-[var(--bg-lighter)]"
          }`}
          style={
            showMenu
              ? {
                  boxShadow: "var(--shadow-sm)",
                }
              : {}
          }
          type="button"
        >
          <Ellipsis className="w-5 h-5 rotate-90" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowMenu(false);
              }}
            />
            <div
              className="absolute right-0 top-10 z-[110] bg-[var(--bg-lightest)] rounded-[var(--border-radius)] py-1.5 min-w-[160px]"
              style={{ boxShadow: "var(--shadow-lg)" }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {!isCompleted && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowMenu(false);
                      setTimeout(() => onEditClick(), 0);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--bg-lighter)] transition-colors"
                  >
                    Edit
                  </button>
                  {canAddDeadline && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowMenu(false);
                        setTimeout(() => onAddDeadlineClick(), 0);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--bg-lighter)] transition-colors"
                    >
                      Add deadline
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowMenu(false);
                  setTimeout(() => onDeleteClick(), 0);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
