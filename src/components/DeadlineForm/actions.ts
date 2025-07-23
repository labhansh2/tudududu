"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { fromZonedTime } from "date-fns-tz";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";

export async function submitDeadline(formData: FormData) {
  const deadline = formData.get("deadline") as string;

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    throw new Error("Timezone not found");
  }

  const utcDate = fromZonedTime(deadline, timezone);
  const now = new Date();

  if (utcDate <= now) {
    throw new Error("Deadline must be in the future");
  }

  try {
    await db
      .insert(deadlines)
      .values({
        userId: userId,
        deadline: utcDate,
      })
      .onConflictDoUpdate({
        target: deadlines.userId,
        set: { deadline: utcDate },
      });
  } catch (error) {
    console.error(error);
    throw new Error("Database error occurred");
  }

  // Only redirect if the database operation was successful
  revalidatePath("/");
  redirect("/");
}
