"use client";
import { useState, useTransition } from "react";
import { format } from "date-fns-tz";

import { setTaskDeadline } from "./actions";

export default function TaskDeadlineEditor({
  taskId,
  defaultValue,
  onClose,
}: {
  taskId: number;
  defaultValue: Date | null;
  onClose: () => void;
}) {
  const [deadlineInput, setDeadlineInput] = useState(
    defaultValue ? format(defaultValue, "yyyy-MM-dd'T'HH:mm") : "",
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!deadlineInput) return;
    setError(null);
    startTransition(async () => {
      try {
        await setTaskDeadline(taskId, deadlineInput);
        onClose();
      } catch (e) {
        setError("Failed to set deadline");
      }
    });
  };

  return (
    <div 
      className="bg-[var(--bg-lightest)] rounded-[var(--border-radius)] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <input
        type="datetime-local"
        value={deadlineInput}
        onChange={(e) => setDeadlineInput(e.target.value)}
        className="w-full sm:flex-1 rounded-[var(--border-radius)] px-3 py-2.5 text-sm bg-[var(--input-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        style={{ 
          colorScheme: "light dark",
          boxShadow: 'var(--shadow-inset)'
        }}
        disabled={isPending}
      />
      <div className="flex gap-2 sm:ml-0">
        <button
          onClick={handleSave}
          disabled={!deadlineInput || isPending}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-[var(--border-radius)] bg-[var(--accent)] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
          style={{
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)'
          }}
        >
          <span 
            className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
            style={{ 
              background: 'var(--gradient-button)',
              opacity: 0.6
            }}
          />
          <span className="relative z-10">Save</span>
        </button>
        <button
          onClick={onClose}
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-[var(--border-radius)] bg-[var(--bg-lighter)] text-[var(--foreground)] hover:bg-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-500 font-medium sm:ml-2">{error}</div>
      )}
    </div>
  );
}


