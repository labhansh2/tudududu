import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";

import DeadlineForm from "@/components/DeadlineForm";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const deadline = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.userId, userId))
    .then((res) => res[0]?.deadline || new Date());

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-darkest)]">
      <DeadlineForm defaultValue={deadline} />
    </div>
  );
}
