"use client";

import { useFormStatus } from "react-dom";

export default function DeadlineFormInput({
  defaultValue,
}: {
  defaultValue: Date;
}) {
  const { pending } = useFormStatus();

  const localDate = new Date(
    defaultValue.getTime() - defaultValue.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="relative">
      <input
        type="datetime-local"
        id="deadline"
        name="deadline"
        required
        className="w-full border border-[var(--input-border)] rounded-[var(--border-radius)] px-4 py-3.5 text-sm sm:text-base bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:dark:hover:bg-gray-700"
        defaultValue={localDate}
        disabled={pending}
        style={{
          colorScheme: "light dark",
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
