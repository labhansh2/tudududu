"use client";

import { Task } from "@/types";

import useTaskFilter from "./use-task-filter";

import TaskTile from "./tile";
import TaskInput from "./input";

export default function TaskList({
  initialTasks,
}: {
  initialTasks: Task[];
}) {
  const { filteredTasks, searchQuery, setSearchQuery } =
    useTaskFilter(initialTasks);

  // this is bad because it might take stale data from the state
  const activeTask = initialTasks.find((task) => task.status === "active");

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
            <TaskTile key={task.id} task={task} activeTask={activeTask} />
          ))
        )}
      </div>
    </div>
  );
}
