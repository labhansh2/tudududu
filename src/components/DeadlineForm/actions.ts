"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";

export async function submitDeadline(formData: FormData) {
  const deadline = formData.get("deadline") as string;
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const selectedDate = new Date(deadline);
  const now = new Date();

  if (selectedDate <= now) {
    throw new Error("Deadline must be in the future");
  }

  try {
    await db
      .insert(deadlines)
      .values({
        userId: userId,
        deadline: new Date(deadline),
      })
      .onConflictDoUpdate({
        target: deadlines.userId,
        set: { deadline: new Date(deadline) },
      });
  } catch (error) {
    console.error(error);
    throw new Error("Database error occurred");
  }

  // Only redirect if the database operation was successful
  revalidatePath("/");
  redirect("/");
}
