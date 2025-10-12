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
      <div className="flex items-center gap-3">
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
            className="w-full px-4 py-3 bg-[var(--input-bg)] rounded-[var(--border-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all text-[var(--foreground)] placeholder-[var(--secondary)]"
            style={{ boxShadow: 'var(--shadow-inset)' }}
            disabled={isPending}
          />
        </div>

        <button
          onClick={() => setShowDeadlinePicker(!showDeadlinePicker)}
          disabled={isPending}
          title={deadlineInput ? "Deadline set" : "Add deadline"}
          className={`flex items-center justify-center w-12 h-12 rounded-[var(--border-radius)] transition-all relative overflow-hidden ${
            deadlineInput
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--bg-lightest)] text-[var(--secondary)] hover:text-[var(--accent)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          style={deadlineInput ? {
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(to bottom, var(--success) 0%, color-mix(in srgb, var(--success) 85%, black) 100%)'
          } : {
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {deadlineInput && (
            <span 
              className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
              style={{ 
                background: 'var(--gradient-button)',
                opacity: 0.6
              }}
            />
          )}
          <Calendar className="w-5 h-5 relative z-10" />
        </button>

        <button
          onClick={handleAddTask}
          disabled={!input.trim() || isPending}
          className="flex items-center justify-center w-12 h-12 bg-[var(--accent)] text-white rounded-[var(--border-radius)] disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
          style={{
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)'
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span 
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{ 
              background: 'var(--gradient-button)',
              opacity: 0.6
            }}
          />
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
          ) : (
            <svg
              className="w-5 h-5 relative z-10"
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
        <div 
          className="mt-3 p-4 bg-[var(--bg-lightest)] rounded-[var(--border-radius)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-[var(--foreground)] font-semibold">
              Set Deadline
            </label>
            {deadlineInput && (
              <button
                onClick={() => setDeadlineInput("")}
                className="text-xs text-[var(--secondary)] hover:text-red-500 transition-colors font-medium"
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
              className="w-full rounded-[var(--border-radius)] px-4 py-3 text-sm sm:text-base bg-[var(--input-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded"
              style={{ 
                colorScheme: "light dark",
                boxShadow: 'var(--shadow-inset)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
