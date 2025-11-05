"use client";

import { useFormStatus } from "react-dom";
import { format } from "date-fns-tz";

export default function DeadlineFormInput({
  defaultValue,
}: {
  defaultValue: Date;
}) {
  const { pending } = useFormStatus();
  return (
    <div className="relative">
      <label
        htmlFor="deadline"
        className="block text-sm font-semibold text-[var(--foreground)] mb-2"
      >
        Deadline Date & Time
      </label>
      <input
        type="datetime-local"
        id="deadline"
        name="deadline"
        required
        className="w-full rounded-[var(--border-radius)] px-4 py-3.5 text-sm sm:text-base bg-[var(--input-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded"
        defaultValue={format(defaultValue, "yyyy-MM-dd'T'HH:mm")}
        disabled={pending}
        style={{
          colorScheme: "light dark",
          boxShadow: "var(--shadow-inset)",
        }}
      />
      {pending && (
        <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
          <div className="animate-spin h-4 w-4 border-2 border-[var(--secondary)] border-t-[var(--accent)] rounded-full"></div>
        </div>
      )}
    </div>
  );
}
