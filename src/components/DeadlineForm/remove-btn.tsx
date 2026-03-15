"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { removeDeadline } from "./actions";

export default function RemoveDeadlineButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => removeDeadline())}
      className="flex items-center justify-center gap-2 py-4 px-4 text-sm sm:text-base font-bold rounded-[var(--border-radius)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--danger)] focus:ring-offset-2 focus:ring-offset-[var(--bg-lightest)] relative overflow-hidden"
      style={{
        boxShadow: "var(--shadow-md)",
        background:
          "linear-gradient(to bottom, var(--danger) 0%, color-mix(in srgb, var(--danger) 85%, black) 100%)",
        color: "white",
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        style={{
          background: "var(--gradient-button)",
          opacity: 0.6,
        }}
      />
      {isPending ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full relative z-10" />
      ) : (
        <Trash2 className="w-5 h-5 relative z-10" />
      )}
    </button>
  );
}
