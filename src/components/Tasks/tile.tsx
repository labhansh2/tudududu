"use client";
import { useState, useTransition } from "react";

import { Task } from "@/types";

import {
  completeTask,
  updateTaskName,
  deleteTask,
  toggleTaskStatus,
} from "./actions";

interface Props {
  task: Task;
  activeTask: Task | undefined;
}

export default function TaskTile({ task, activeTask }: Props) {
  const [toggleIsPending, startToggleTransition] = useTransition();
  const [completeIsPending, startCompleteTransition] = useTransition();
  const [editIsPending, startEditTransition] = useTransition();

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

  const getTaskStyles = () => {
    if (task.status === "completed") {
      return "bg-[var(--completed-task)] border-[var(--border)]";
    }
    if (activeTask?.id === task.id) {
      return "bg-[var(--active-task)] border-[var(--accent)]";
    }
    return "bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--accent)]/50";
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${getTaskStyles()}`}
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
    </div>
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
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
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
          {completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
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
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
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
