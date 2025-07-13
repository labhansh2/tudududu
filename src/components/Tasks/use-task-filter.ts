"use client";

import { useMemo, useState } from "react";

import { type TaskWithStatsAndSparkline } from "./actions";

export default function useTaskFilter(
  initialTasks: TaskWithStatsAndSparkline[],
  sort: "all" | "completed" | "incomplete" = "all",
) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = useMemo(() => {
    let filtered = initialTasks;

    if (searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    switch (sort) {
      case "completed":
        filtered = filtered.filter((task) => task.status === "completed");
        break;
      case "incomplete":
        filtered = filtered.filter((task) => task.status !== "completed");
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;

      if (a.status === "active" && b.status === "not_active") return -1;
      if (b.status === "active" && a.status === "not_active") return 1;

      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, [initialTasks, searchQuery, sort]);

  return { filteredTasks, searchQuery, setSearchQuery };
}
