"use client";

import { useFormStatus } from "react-dom";

export default function DeadlineFormSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full bg-[var(--accent)] text-white font-bold py-4 px-4 text-sm sm:text-base rounded-[var(--border-radius)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-lightest)] flex items-center justify-center gap-2 relative overflow-hidden"
      disabled={pending}
      style={{
        boxShadow: 'var(--shadow-md)',
        background: 'linear-gradient(to bottom, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)'
      }}
      onMouseEnter={(e) => {
        if (!pending) {
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          e.currentTarget.style.transform = 'translateY(-2px)';
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
      {pending ? (
        <>
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full relative z-10"></div>
          <span className="relative z-10">Setting deadline...</span>
        </>
      ) : (
        <>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="relative z-10">Set Deadline</span>
        </>
      )}
    </button>
  );
}
