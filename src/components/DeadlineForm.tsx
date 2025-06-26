"use client";
import { useState, useTransition } from "react";

interface DeadlineFormProps {
  defaultValue: string;
  submitDeadline: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function DeadlineForm({
  defaultValue,
  submitDeadline,
}: DeadlineFormProps) {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError("");

    // Client-side validation for past dates
    const deadlineValue = formData.get("deadline") as string;
    const selectedDate = new Date(deadlineValue);
    const now = new Date();

    if (selectedDate <= now) {
      setError("Deadline must be in the future");
      return;
    }

    startTransition(async () => {
      const result = await submitDeadline(formData);
      if (!result.success) {
        setError(result.error || "Failed to set deadline. Please try again.");
      }
      // If successful, the server action will handle the redirect
    });
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white dark:bg-neutral-800 p-10 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-5 w-full max-w-md"
    >
      <label
        htmlFor="deadline"
        className="text-base font-normal text-neutral-700 dark:text-neutral-200 mb-2 tracking-wide select-none"
      >
        Set the deadline of your goal
      </label>
      <input
        type="datetime-local"
        id="deadline"
        name="deadline"
        required
        className="border-[var(--input-border)] rounded-[var(--border-radius)] px-3 py-3 text-sm focus:outline-none focus:border-[var(--input-focus)] transition-all bg-gray-50 dark:bg-neutral-700 dark:text-gray-100"
        defaultValue={defaultValue}
        disabled={isPending}
      />
      <button
        type="submit"
        className="mt-3 font-medium py-2.5 text-sm transition-all bg-[var(--primary)] text-[var(--button-color)] rounded-[var(--border-radius)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
      >
        {isPending ? "Setting deadline..." : "Submit"}
      </button>
      {error && (
        <div className="text-red-600 dark:text-red-400 mt-2 text-center text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
