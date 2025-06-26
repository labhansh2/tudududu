"use client";
import { useState, useTransition, useMemo } from "react";
import TaskTile from "./TaskTile";
import TaskInput from "./TaskInput";
import {
  addTask,
  editTask,
  deleteTask,
  toggleWorkingStatus,
  completeTask,
} from "@/app/(main)/actions";

interface Task {
  id: number;
  name: string;
  status: "active" | "not_active" | "completed";
  updatedAt: Date;
  createdAt: Date;
  userId: string;
  // test: string | null;
}

interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = initialTasks;

    if (searchQuery.trim()) {
      filtered = initialTasks.filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort: completed tasks at bottom, then by updatedAt desc
    return filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;

      // Active tasks go to top among non-completed
      if (a.status === "active" && b.status === "not_active") return -1;
      if (b.status === "active" && a.status === "not_active") return 1;

      // Then by updatedAt desc
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [initialTasks, searchQuery]);

  const activeTask = initialTasks.find((task) => task.status === "active");

  const handleAddTask = async (taskName: string) => {
    startTransition(async () => {
      try {
        await addTask(taskName);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    });
  };

  const handleToggleWorking = async (taskId: number) => {
    startTransition(async () => {
      try {
        await toggleWorkingStatus(taskId);
      } catch (error) {
        console.error("Failed to toggle working status:", error);
      }
    });
  };

  const handleComplete = async (taskId: number) => {
    startTransition(async () => {
      try {
        await completeTask(taskId);
      } catch (error) {
        console.error("Failed to complete task:", error);
      }
    });
  };

  const handleEdit = async (taskId: number, newName: string) => {
    startTransition(async () => {
      try {
        await editTask(taskId, newName);
      } catch (error) {
        console.error("Failed to edit task:", error);
      }
    });
  };

  const handleDelete = async (taskId: number) => {
    startTransition(async () => {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <TaskInput onSearch={setSearchQuery} onAddTask={handleAddTask} />

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 bg-[var(--active-task)] rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[var(--accent)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-[var(--secondary)] text-sm">
              {searchQuery
                ? `No tasks match "${searchQuery}"`
                : "No tasks yet. Add one above to get started."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskTile
              key={task.id}
              task={task}
              isActiveTask={activeTask?.id === task.id}
              onToggleWorking={handleToggleWorking}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
