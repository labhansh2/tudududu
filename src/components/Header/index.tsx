import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Edit } from "lucide-react";
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

  if (!userDeadline) {
    redirect("/deadline");
  }

  const { totalSecondsToday, sessionIsActive } =
    await getTotalSecondsToday();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            <Countdown
              secondsLeft={
                (userDeadline.getTime() - new Date().getTime()) / 1000
              }
            />

            <Link
              href="/deadline"
              className="px-3 py-1.5 text-sm font-medium text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <Edit className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
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
