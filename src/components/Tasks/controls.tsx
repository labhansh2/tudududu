"use client";

import { useState, useTransition } from "react";

interface Props {
  sort: "all" | "completed" | "incomplete";
  setSort: (sort: "all" | "completed" | "incomplete") => void;
  detailedView: boolean;
  setDetailedView: (detailedView: boolean) => void;
}

export default function Controls({
  sort,
  setSort,
  detailedView,
  setDetailedView,
}: Props) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <button
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              sort === "all"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
            }`}
            onClick={() => setSort("all")}
          >
            All
          </button>
          <button
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              sort === "incomplete"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
            }`}
            onClick={() => setSort("incomplete")}
          >
            Incomplete
          </button>
          <button
            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
              sort === "completed"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
            }`}
            onClick={() => setSort("completed")}
          >
            Completed
          </button>
           
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]">Detailed</span>
          <ToggleSwitch 
            checked={detailedView} 
            onChange={setDetailedView} 
          />
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-[var(--background)] ${
        checked 
          ? "bg-[var(--accent)]" 
          : "bg-[var(--border)]"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
