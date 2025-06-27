"use client";
import { useState } from "react";

import { addTask } from "@/actions";

interface TaskInputProps {
  onSearch: (query: string) => void;
  // onAddTask: (taskName: string) => Promise<void>;
}

export default function TaskInput({ onSearch }: TaskInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    onSearch(value);
  };

  const handleAddTask = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      // await onAddTask(input.trim());
      await addTask(input.trim());
      setInput("");
      onSearch(""); // Clear search after adding
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          placeholder="Add a task or search..."
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--foreground)] placeholder-[var(--secondary)]"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleAddTask}
        disabled={!input.trim() || isLoading}
        className="flex items-center justify-center w-11 h-11 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
