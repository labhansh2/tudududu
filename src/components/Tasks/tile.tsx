"use client";
import { useState, useTransition } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Check, Ellipsis } from "lucide-react";

import { useMobile } from "@/hooks/useMobile";

import { type TaskWithStatsAndSparkline } from "./actions";
import { getTaskStyles } from "./utils";

import {
  completeTask,
  updateTaskName,
  deleteTask,
  toggleTaskStatus,
  type SparklineData,
} from "./actions";

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

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${getTaskStyles(task.status)}`}
    >
      <div className="flex items-center gap-3">
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
          onDeleteClick={handleDeleteTask}
        />
      </div>

      {/* Detailed view */}
      {isDetailedView && (
        <div className="mt-2 pt-2 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between gap-3">
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
    </div>
  );
}

interface StatsProps {
  totalTime: number;
  longestSession: number;
}

function Stats({ totalTime, longestSession }: StatsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-base font-bold text-[var(--foreground)] leading-none">
          {(totalTime / 3600).toFixed(1)}h
        </div>
        <div className="text-[9px] text-[var(--secondary)] uppercase tracking-wider mt-0.5">
          Total
        </div>
      </div>
      <div className="w-px h-6 bg-[var(--border)]"></div>
      <div className="text-center">
        <div className="text-base font-bold text-[var(--success)] leading-none">
          {(longestSession / 3600).toFixed(1)}h
        </div>
        <div className="text-[9px] text-[var(--secondary)] uppercase tracking-wider mt-0.5">
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
        <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all">
          <div className="w-3 h-3 rounded bg-white animate-ping"></div>
        </div>
      ) : (
        <button
          onClick={() => handleToggleTaskStatus()}
          disabled={disabled}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            checked
              ? "bg-[var(--accent)] border-[var(--accent)]"
              : "border-[var(--border)] hover:border-[var(--accent)]"
          }`}
        >
          {checked && <Check className="w-3 h-3 text-white" />}
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
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all border-[var(--success)]">
          <div className="w-3 h-3 rounded-full bg-[var(--success)] animate-ping"></div>
        </div>
      ) : (
        <button
          onClick={() => handleCompleteTask()}
          disabled={disabled}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            completed
              ? "bg-[var(--success)] border-[var(--success)]"
              : "border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success)]"
          } ${completed ? "cursor-default" : "cursor-pointer"}`}
        >
          {completed && <Check className="w-3 h-3 text-white" />}
        </button>
      )}
    </>
  );
}

interface MenuProps {
  isCompleted: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

function Menu({ isCompleted, onEditClick, onDeleteClick }: MenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-5 h-5 flex items-center justify-center text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          // disabled={editIsPending}
        >
          <Ellipsis className="w-4 h-4 rotate-90" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-6 z-20 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[100px]">
              {!isCompleted && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditClick();
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--active-task)] transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteClick();
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
