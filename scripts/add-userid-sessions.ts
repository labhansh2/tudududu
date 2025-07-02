import { db } from "@/drizzle";
import { sessions, tasks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  await db
    .update(sessions)
    .set({ userId: tasks.userId })
    .from(tasks)
    .where(eq(sessions.taskId, tasks.id));
}

main();
