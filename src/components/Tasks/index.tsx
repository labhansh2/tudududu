"use client";
import { useState } from "react";

import { Task } from "@/types";

import useTaskFilter from "./use-task-filter";

import TaskTile from "./tile";
import TaskInput from "./input";
import Controls from "./controls";

export default function TaskList({
  initialTasks,
}: {
  initialTasks: Task[];
}) {
  const [sort, setSort] = useState<"all" | "completed" | "incomplete">(
    "all",
  );
  const [detailedView, setDetailedView] = useState(false);

  const { filteredTasks, searchQuery, setSearchQuery } =
    useTaskFilter(initialTasks, sort);

  // this is bad because it might take stale data from the state
  const activeTask = initialTasks.find((task) => task.status === "active");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <TaskInput onSearch={setSearchQuery} />

      <Controls
        sort={sort}
        setSort={setSort}
        detailedView={detailedView}
        setDetailedView={setDetailedView}
      />

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--secondary)] text-sm">
              {searchQuery
                ? `No tasks match "${searchQuery}"`
                : sort === "completed"
                  ? "No completed tasks yet."
                  : sort === "incomplete"
                    ? "No incomplete tasks."
                    : "No tasks yet. Add one above to get started."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskTile
              key={task.id}
              task={task}
              activeTask={activeTask}
              isDetailedView={detailedView}
            />
          ))
        )}
      </div>
    </div>
  );
}
