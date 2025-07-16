"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle";
import { deadlines, sessions, workTime } from "@/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { format, toZonedTime } from "date-fns-tz";

export async function getDeadline() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const deadline = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.userId, userId))
    .then((res) => res[0]?.deadline || null);

  return deadline;
}

export async function getTotalSecondsToday() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    throw new Error("Timezone not found");
  }

  const todayInUserTz = format(
    toZonedTime(new Date(), timezone),
    "yyyy-MM-dd",
  );

  const totalSecondsToday = await db
    .select({ total: workTime.total_seconds })
    .from(workTime)
    .where(
      and(eq(workTime.userId, userId), eq(workTime.date, todayInUserTz)),
    )
    .then((res) => res[0]?.total || 0);

  const activeSessionStartedAt = await db
    .select({ startedAt: sessions.startedAt })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.endedAt)))
    .then((res) => res[0]?.startedAt || null);

  if (!activeSessionStartedAt) {
    return {
      totalSecondsToday: totalSecondsToday,
      sessionIsActive: false,
    };
  }

  return {
    totalSecondsToday:
      totalSecondsToday +
      Math.floor(
        (new Date().getTime() - activeSessionStartedAt.getTime()) / 1000,
      ),
    sessionIsActive: true,
  };
}
