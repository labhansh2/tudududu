"use client";
import { useState, useTransition, useMemo } from "react";

import { Task } from "@/types";
import useTaskFilter from "@/hooks/use-taskfilter";
import {
  addTask,
  editTask,
  deleteTask,
  toggleWorkingStatus,
  completeTask,
} from "@/actions";

import TaskTile from "./TaskTile";
import TaskInput from "./TaskInput";

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const { filteredTasks, searchQuery, setSearchQuery } =
    useTaskFilter(initialTasks);

  const activeTask = initialTasks.find((task) => task.status === "active");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleToggleWorkingStatus = async (taskId: number) => {
    await toggleWorkingStatus(taskId, activeTask, timezone);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <TaskInput onSearch={setSearchQuery} />

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            {/* <div className="w-12 h-12 mx-auto mb-4 bg-[var(--active-task)] rounded-full flex items-center justify-center">
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
            </div> */}
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
              onToggleWorkingStatus={handleToggleWorkingStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
