"use client";

import { useMemo, useState } from "react";

import { Task } from "@/types";

export default function useTaskFilter(initialTasks: Task[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTasks = useMemo(() => {
    let filtered = initialTasks;

    if (searchQuery.trim()) {
      filtered = initialTasks.filter((task) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
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
  }, [initialTasks, searchQuery]);

  return { filteredTasks, searchQuery, setSearchQuery };
}
