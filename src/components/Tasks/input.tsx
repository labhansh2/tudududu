"use client";
import { useState, useTransition } from "react";
import { Calendar, X } from "lucide-react";

import { createTask } from "./actions";

export default function TaskInput({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [input, setInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
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
      await createTask(input.trim(), deadlineInput || null);
      setInput("");
      setDeadlineInput("");
      setShowDeadlinePicker(false);
      onSearch("");
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
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
          onClick={() => setShowDeadlinePicker(!showDeadlinePicker)}
          disabled={isPending}
          title={deadlineInput ? "Deadline set" : "Add deadline"}
          className={`flex items-center justify-center w-11 h-11 rounded-lg border transition-colors ${
            deadlineInput
              ? "bg-green-500 text-white border-green-500"
              : "bg-[var(--card-bg)] text-[var(--secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Calendar className="w-5 h-5" />
        </button>

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

      {showDeadlinePicker && (
        <div className="mt-2 p-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[var(--secondary)] font-medium">
              Set Deadline
            </label>
            {deadlineInput && (
              <button
                onClick={() => setDeadlineInput("")}
                className="text-xs text-[var(--secondary)] hover:text-red-500 transition-colors"
                title="Clear deadline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="w-full border border-[var(--input-border)] rounded-[var(--border-radius)] px-4 py-3.5 text-sm sm:text-base bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:dark:hover:bg-gray-700"
              style={{ colorScheme: "light dark" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
