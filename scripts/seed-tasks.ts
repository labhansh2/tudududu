import { db } from "@/drizzle";
import { tasks } from "@/drizzle/schema";

const userId = process.env.TEST_USER_ID!;

const sampleTasks = [
  { name: "Complete project documentation", status: "active" as const },
  { name: "Review code changes", status: "active" as const },
  { name: "Fix bug in authentication", status: "completed" as const },
  { name: "Implement new feature", status: "active" as const },
  { name: "Write unit tests", status: "not_active" as const },
  { name: "Deploy to staging", status: "completed" as const },
  { name: "Optimize database queries", status: "active" as const },
  { name: "Update dependencies", status: "not_active" as const },
];

async function main() {
  if (!userId) {
    throw new Error("TEST_USER_ID environment variable is required");
  }

  console.log(`Seeding tasks for user: ${userId}`);

  const insertedTasks = await db
    .insert(tasks)
    .values(
      sampleTasks.map((task) => ({
        userId,
        name: task.name,
        status: task.status,
      })),
    )
    .returning();

  console.log(`✅ Successfully seeded ${insertedTasks.length} tasks`);
  console.log(
    "Tasks created:",
    insertedTasks.map(
      (task) => `${task.id}: ${task.name} (${task.status})`,
    ),
  );
}

main().catch((error) => {
  console.error("Error seeding tasks:", error);
  process.exit(1);
});
