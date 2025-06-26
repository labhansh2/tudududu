import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";
import { submitDeadline } from "./_submit";

import DeadlineForm from "@/components/DeadlineForm";

export default async function Page() {
  const { userId } = await auth();
  const deadline = await db.select().from(deadlines).where(eq(deadlines.userId, userId!));

  const defaultValue =
    deadline.length > 0 && deadline[0].deadline
      ? new Date(deadline[0].deadline).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <DeadlineForm defaultValue={defaultValue} submitDeadline={submitDeadline} />
    </div>
  );
}