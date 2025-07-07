"use client";

import { useFormStatus } from "react-dom";

export default function DeadlineFormSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full bg-[var(--accent)] hover:bg-[var(--success)] text-white font-medium py-3.5 px-4 text-sm sm:text-base rounded-[var(--border-radius)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] flex items-center justify-center gap-2"
      disabled={pending}
    >
      {pending ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Setting deadline...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Set Deadline
        </>
      )}
    </button>
  );
}
