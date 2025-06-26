import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { tasks } from "@/drizzle/schema";
import TaskList from "@/components/TaskList";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's tasks
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(tasks.updatedAt);

  return (
    <div className="pb-8">
      <TaskList initialTasks={userTasks} />
    </div>
  );
}
