import Form from "next/form";

import { submitDeadline } from "./actions";

import DeadlineFormInput from "./input";
import DeadlineFormSubmit from "./submit-btn";

export default async function DeadlineForm({
  defaultValue,
}: {
  defaultValue: Date;
}) {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
          Set Your Milestone Date
        </h1>
        <p className="text-[var(--secondary)] text-sm sm:text-base leading-relaxed font-medium">
          Choose a goal you have coming up. This can be an important exam
          that is coming up, a big project, or just a deadline you wanna
          mark as your milestone date.
        </p>
      </div>

      <Form
        action={submitDeadline}
        className="bg-[var(--bg-lightest)] rounded-[var(--border-radius)] p-6 sm:p-8 space-y-6"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <DeadlineFormInput defaultValue={defaultValue} />
        <DeadlineFormSubmit />
      </Form>
    </div>
  );
}
