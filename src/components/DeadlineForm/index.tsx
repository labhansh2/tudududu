"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { submitDeadline, type DeadlineFormState } from "./actions";

import DeadlineFormInput from "./input";
import DeadlineFormSubmit from "./submit-btn";
import RemoveDeadlineButton from "./remove-btn";

export default function DeadlineForm({
  defaultValue,
  hasExisting,
}: {
  defaultValue: Date;
  hasExisting: boolean;
}) {
  const [state, formAction] = useActionState<DeadlineFormState, FormData>(
    submitDeadline,
    null,
  );

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Milestone Date
        </h1>
        <p className="text-(--secondary) text-sm sm:text-base leading-relaxed font-medium">
          This deadline is not associated with any individual task. 
          This deadline defines a vague phase in which you wanna complete certain things with a certain mentality or mindset.
        </p>
      </div>

      <form
        action={formAction}
        className="bg-(--bg-lightest) rounded-(--border-radius) p-6 sm:p-8 space-y-6"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <DeadlineFormInput defaultValue={defaultValue} />

        {state?.error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-(--border-radius) bg-(--bg-lighter) text-sm font-medium text-(--danger)"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <CircleAlert className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <DeadlineFormSubmit />
          {hasExisting && <RemoveDeadlineButton />}
        </div>
      </form>
    </div>
  );
}
