"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { submitDeadline, type DeadlineFormState } from "./actions";

import DeadlineFormInput from "./input";
import DeadlineFormSubmit from "./submit-btn";

export default function DeadlineForm({
  defaultValue,
}: {
  defaultValue: Date;
}) {
  const [state, formAction] = useActionState<DeadlineFormState, FormData>(
    submitDeadline,
    null,
  );

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
          Set Your Milestone Date
        </h1>
        <p className="text-[var(--secondary)] text-sm sm:text-base leading-relaxed font-medium">
          Milestone Date
        </p>
      </div>

      <form
        action={formAction}
        className="bg-[var(--bg-lightest)] rounded-[var(--border-radius)] p-6 sm:p-8 space-y-6"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <DeadlineFormInput defaultValue={defaultValue} />

        {state?.error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-[var(--border-radius)] text-sm font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--danger) 10%, transparent)",
              color: "var(--danger)",
              border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)",
            }}
          >
            <CircleAlert className="w-4 h-4 flex-shrink-0" />
            {state.error}
          </div>
        )}

        <DeadlineFormSubmit />
      </form>
    </div>
  );
}
