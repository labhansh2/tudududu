import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";

export default async function Home() {
  const { userId } = await auth();
  const deadline = await db.select().from(deadlines).where(eq(deadlines.userId, userId!));

  if (deadline.length === 0) {
    redirect("/deadline");
  }

  return (
    <>
      <div>Main Page</div>
      <SignOutButton />
    </>
  );
}
