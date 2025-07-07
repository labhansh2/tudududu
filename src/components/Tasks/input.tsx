"use client";
import { useState, useTransition } from "react";

import { createTask } from "@/components/Tasks/actions";

export default function TaskInput({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  // debounce isn't needed here, but it's a good practice to use it
  // use it if you wanna update using the search params
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const handler = setTimeout(() => {
      onSearch(value);
    }, 500);
    setInput(value);
    return () => clearTimeout(handler);
  };

  const handleAddTask = async () => {
    if (!input.trim()) return;

    startTransition(async () => {
      await createTask(input.trim());
      setInput("");
      onSearch("");
    });
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleAddTask();
            }
          }}
          placeholder="Add a task or search..."
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--foreground)] placeholder-[var(--secondary)]"
          disabled={isPending}
        />
      </div>

      <button
        onClick={handleAddTask}
        disabled={!input.trim() || isPending}
        className="flex items-center justify-center w-11 h-11 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? (
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
