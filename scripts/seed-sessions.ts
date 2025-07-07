import { db } from "@/drizzle";
import { sessions, tasks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const userId = process.env.TEST_USER_ID!;

async function main() {
  if (!userId) {
    throw new Error("TEST_USER_ID environment variable is required");
  }

  console.log(`Seeding sessions for user: ${userId}`);

  // Update existing sessions to have correct userId from tasks
  await db
    .update(sessions)
    .set({ userId: tasks.userId })
    .from(tasks)
    .where(eq(sessions.taskId, tasks.id));

  // Get all tasks for the user to create sessions for them
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));

  if (userTasks.length === 0) {
    console.log(
      "No tasks found for user. Please run seed-tasks.ts first.",
    );
    return;
  }

  // Create sample sessions for each task
  const sessionData = [];
  const now = new Date();

  for (let i = 0; i < userTasks.length; i++) {
    const task = userTasks[i];
    const daysAgo = Math.floor(Math.random() * 7); // Random day within last week
    const hoursAgo = Math.floor(Math.random() * 8) + 1; // 1-8 hours ago
    const sessionDuration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes

    const startedAt = new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000,
    );
    const endedAt = new Date(
      startedAt.getTime() + sessionDuration * 60 * 1000,
    );

    sessionData.push({
      taskId: task.id,
      userId,
      startedAt,
      endedAt,
    });

    // Add some tasks with multiple sessions
    if (Math.random() > 0.5) {
      const secondStartedAt = new Date(
        startedAt.getTime() + 2 * 60 * 60 * 1000,
      ); // 2 hours later
      const secondDuration = Math.floor(Math.random() * 90) + 15; // 15-105 minutes
      const secondEndedAt = new Date(
        secondStartedAt.getTime() + secondDuration * 60 * 1000,
      );

      sessionData.push({
        taskId: task.id,
        userId,
        startedAt: secondStartedAt,
        endedAt: secondEndedAt,
      });
    }
  }

  // Add some ongoing sessions (without endedAt)
  if (userTasks.length > 0) {
    const randomTask =
      userTasks[Math.floor(Math.random() * userTasks.length)];
    const ongoingStartTime = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 minutes ago

    sessionData.push({
      taskId: randomTask.id,
      userId,
      startedAt: ongoingStartTime,
      endedAt: null, // Ongoing session
    });
  }

  const insertedSessions = await db
    .insert(sessions)
    .values(sessionData)
    .returning();

  console.log(
    `✅ Successfully seeded ${insertedSessions.length} sessions`,
  );
  console.log(
    "Sessions created for tasks:",
    userTasks.map((task) => task.name),
  );
}

main().catch((error) => {
  console.error("Error seeding sessions:", error);
  process.exit(1);
});
