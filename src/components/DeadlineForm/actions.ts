"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { fromZonedTime } from "date-fns-tz";

import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";

export type DeadlineFormState = {
  error?: string;
} | null;

export async function submitDeadline(
  _prevState: DeadlineFormState,
  formData: FormData,
): Promise<DeadlineFormState> {
  const deadline = formData.get("deadline") as string;

  if (!deadline) {
    return { error: "Please select a deadline date and time" };
  }

  const { userId } = await auth();

  if (!userId) {
    return { error: "You must be signed in to set a deadline" };
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    return { error: "Timezone not detected. Please refresh and try again." };
  }

  const utcDate = fromZonedTime(deadline, timezone);

  if (isNaN(utcDate.getTime())) {
    return { error: "Invalid date format. Please select a valid date." };
  }

  if (utcDate <= new Date()) {
    return { error: "Deadline must be in the future" };
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
    return { error: "Failed to save deadline. Please try again." };
  }

  revalidatePath("/");
  redirect("/");
}
