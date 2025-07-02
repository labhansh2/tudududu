"use client";
import { useTransition } from "react";

import { Task } from "@/types";
import useTaskFilter from "@/hooks/use-taskfilter";
import { toggleWorkingStatus } from "@/actions";

import TaskTile from "./TaskTile";
import TaskInput from "./TaskInput";

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
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
