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
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <input
        type="datetime-local"
        value={deadlineInput}
        onChange={(e) => setDeadlineInput(e.target.value)}
        className="w-full sm:flex-1 border border-[var(--input-border)] rounded-[var(--border-radius)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent"
        style={{ colorScheme: "light dark" }}
        disabled={isPending}
      />
      <div className="flex gap-2 sm:ml-0">
        <button
          onClick={handleSave}
          disabled={!deadlineInput || isPending}
          className="w-full sm:w-auto px-3 py-2 text-sm rounded bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={onClose}
          disabled={isPending}
          className="w-full sm:w-auto px-3 py-2 text-sm rounded border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--active-task)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-500 sm:ml-2">{error}</div>
      )}
    </div>
  );
}


