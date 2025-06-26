"use client";
import { useState } from "react";

interface Task {
  id: number;
  name: string;
  status: "active" | "not_active" | "completed";
  updatedAt: Date;
}

interface TaskTileProps {
  task: Task;
  isActiveTask: boolean;
  onToggleWorking: (taskId: number) => Promise<void>;
  onComplete: (taskId: number) => Promise<void>;
  onEdit: (taskId: number, newName: string) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskTile({
  task,
  isActiveTask,
  onToggleWorking,
  onComplete,
  onEdit,
  onDelete,
}: TaskTileProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    if (!editName.trim() || editName === task.name) {
      setIsEditing(false);
      setEditName(task.name);
      return;
    }

    setIsLoading(true);
    try {
      await onEdit(task.id, editName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit task:", error);
      setEditName(task.name);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(task.name);
    }
  };

  const getTaskStyles = () => {
    if (task.status === "completed") {
      return "bg-[var(--completed-task)] border-[var(--border)]";
    }
    if (isActiveTask) {
      return "bg-[var(--active-task)] border-[var(--accent)]";
    }
    return "bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--accent)]/50";
  };

  return (
    <div className={`p-4 rounded-lg border transition-all ${getTaskStyles()}`}>
      <div className="flex items-center gap-3">
        {/* Working status checkbox */}
        <button
          onClick={() => onToggleWorking(task.id)}
          disabled={task.status === "completed" || isLoading}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isActiveTask
              ? "bg-[var(--accent)] border-[var(--accent)]"
              : "border-[var(--border)] hover:border-[var(--accent)]"
          } ${task.status === "completed" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isActiveTask && (
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

        {/* Task name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEdit}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent border-none outline-none text-[var(--foreground)] font-medium"
              autoFocus
              disabled={isLoading}
            />
          ) : (
            <span
              className={`block truncate font-medium ${
                task.status === "completed"
                  ? "line-through text-[var(--secondary)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {task.name}
            </span>
          )}
        </div>

        {/* Complete button */}
        <button
          onClick={() => onComplete(task.id)}
          disabled={task.status === "completed" || isLoading}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            task.status === "completed"
              ? "bg-[var(--success)] border-[var(--success)]"
              : "border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success)]"
          } ${task.status === "completed" ? "cursor-default" : "cursor-pointer"}`}
        >
          {task.status === "completed" && (
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

        {/* Options menu */}
        {task.status !== "completed" && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-5 h-5 flex items-center justify-center text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
              disabled={isLoading}
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
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--active-task)] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
