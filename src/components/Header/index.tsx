import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CalendarPlus, Edit } from "lucide-react";
import Link from "next/link";

import TimeZoneSetter from "@/components/TimeZoneSetter";

import { getDeadline, getTotalSecondsToday } from "./actions";
import Countdown from "./countdown";
import Nav from "./nav";
import TotalTimeSpentToday from "./time-today";

export default async function Header() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    return <TimeZoneSetter />;
  }

  const userDeadline = await getDeadline();
  const hasValidDeadline =
    userDeadline && userDeadline.getTime() > Date.now();

  const { totalSecondsToday, sessionIsActive } =
    await getTotalSecondsToday();

  return (
    <header
      className="bg-[var(--bg-lightest)] relative"
      style={{
        boxShadow: "var(--shadow-sm)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            {hasValidDeadline ? (
              <>
                <Countdown
                  secondsLeft={
                    (userDeadline.getTime() - new Date().getTime()) / 1000
                  }
                />
                <Link
                  href="/deadline"
                  className="px-2 sm:px-3 py-1.5 text-sm font-medium text-[var(--secondary)] hover:text-[var(--foreground)] transition-all rounded-lg hover:bg-[var(--bg-lighter)] flex-shrink-0"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <Link
                href="/deadline"
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-[var(--border-radius)] bg-[var(--bg-lighter)] min-w-0 hover:bg-[var(--bg-base)] transition-colors"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <CalendarPlus className="w-4 h-4 text-[var(--secondary)]" />
                <span className="font-mono text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Set Milestone
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <TotalTimeSpentToday
              initialTotalSeconds={totalSecondsToday}
              sessionIsActive={sessionIsActive}
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
