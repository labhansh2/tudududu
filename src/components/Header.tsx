import { UserButton } from "@clerk/nextjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/drizzle/index";
import { deadlines, sessions, tasks, workTime } from "@/drizzle/schema";
import Countdown from "./Countdown";
import { redirect } from "next/navigation";
import Nav from "./Nav";
import { cookies } from "next/headers";
import { DateTime } from "luxon";
import TotalTimeSpentToday from "./TotalTimeSpentToday";

interface HeaderProps {
  userId: string;
}

export default async function Header({ userId }: { userId: string }) {
  // Get user's deadline
  const userDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.userId, userId));

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (userDeadlines.length === 0 || !timezone) {
    redirect("/deadline");
  }

  const today = DateTime.now().setZone(timezone).toISODate();

  const totalSecondsToday = await db
    .select({ total: workTime.total_seconds })
    .from(workTime)
    .where(
      and(
        eq(workTime.userId, userId),
        eq(
          // Compare only the date part (YYYY-MM-DD) of the timestamp in the DB
          workTime.date,
          new Date(`${today}`),
        ),
      ),
    )
    .then((res) => res[0]?.total || 0);

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
