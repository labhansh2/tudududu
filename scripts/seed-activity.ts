import { db } from "@/drizzle";
import { workTime } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

async function seedActivity() {
  const userId = process.env.TEST_USER_ID!;

  // Clear existing data for this user
  await db.delete(workTime).where(eq(workTime.userId, userId));

  const activityData = [];
  const currentDate = new Date();

  // Generate data for the last 3 years
  for (let year = 0; year < 3; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(
        currentDate.getFullYear() - year,
        month + 1,
        0,
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          currentDate.getFullYear() - year,
          month,
          day,
        );

        // Skip future dates
        if (date > currentDate) continue;

        // Generate realistic work patterns
        // 70% chance of working on weekdays, 20% on weekends
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const workProbability = isWeekend ? 0.2 : 0.7;

        if (Math.random() < workProbability) {
          // Generate work time between 30 minutes to 8 hours (1800 to 28800 seconds)
          const minWorkTime = 30 * 60; // 30 minutes
          const maxWorkTime = 8 * 60 * 60; // 8 hours
          const totalSeconds =
            Math.floor(Math.random() * (maxWorkTime - minWorkTime)) +
            minWorkTime;

          activityData.push({
            userId,
            date: date.toISOString().split('T')[0], // Convert Date to "YYYY-MM-DD" string
            total_seconds: totalSeconds,
          });
        }
      }
    }
  }

  // Insert data in batches to avoid overwhelming the database
  const batchSize = 100;
  for (let i = 0; i < activityData.length; i += batchSize) {
    const batch = activityData.slice(i, i + batchSize);
    await db.insert(workTime).values(batch);
    console.log(
      `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(activityData.length / batchSize)}`,
    );
  }

  console.log(
    `Successfully seeded ${activityData.length} activity records for user ${userId}`,
  );
}

seedActivity().catch(console.error);
