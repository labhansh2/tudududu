import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/drizzle";
import { deadlines, sessions, workTime } from "@/drizzle/schema";

import Countdown from "./countdown";
import Nav from "./nav";
import TimeZoneSetter from "../TimeZoneSetter";
import TotalTimeSpentToday from "./time-today";

export default async function Header() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's deadline
  const userDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.userId, userId));

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (userDeadlines.length === 0) {
    redirect("/deadline");
  }

  if (!timezone) {
    return <TimeZoneSetter />;
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: timezone,
  });

  // get total seconds spent today (User Timezone)
  const totalSecondsToday = await db
    .select({ total: workTime.total_seconds })
    .from(workTime)
    .where(and(eq(workTime.userId, userId), eq(workTime.date, today)))
    .then((res) => res[0]?.total || 0);

  // get active session started at (UTC)
  const activeSessionStartedAt = await db
    .select({ startedAt: sessions.startedAt })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNull(sessions.endedAt)))
    .then((res) => res[0]?.startedAt || null);

  const deadline = userDeadlines[0].deadline;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Countdown deadline={deadline} />

          <div className="flex items-center gap-3">
            <TotalTimeSpentToday
              totalSeconds={totalSecondsToday}
              activeSessionStartedAt={activeSessionStartedAt}
            />
            <Nav />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
