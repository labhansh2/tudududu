async function submitDeadline(formData: FormData) {
  'use server'
  
  const deadline = formData.get('deadline') as string
  console.log('Deadline submitted:', deadline)
  // Handle the deadline submission here
}

export default function Deadline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <form 
        action={submitDeadline}
        className="bg-white dark:bg-neutral-800 p-10 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col gap-5 w-full max-w-md"
      >
        <label htmlFor="deadline" className="text-base font-normal text-neutral-700 dark:text-neutral-200 mb-2 tracking-wide select-none">
          Set the deadline of your goal
        </label>
        <input
          type="datetime-local"
          id="deadline"
          name="deadline"
          required
          className="border-[var(--input-border)] rounded-[var(--border-radius)] px-3 py-3 text-sm focus:outline-none focus:border-[var(--input-focus)] transition-all bg-gray-50 dark:bg-neutral-700 dark:text-gray-100"
        />
        <button
          type="submit"
          className="mt-3 font-medium py-2.5 text-sm transition-all bg-[var(--primary)] text-[var(--button-color)] rounded-[var(--border-radius)] hover:bg-[var(--primary-hover)]"
        >
          Submit
        </button>
      </form>
    </div>
  );
}