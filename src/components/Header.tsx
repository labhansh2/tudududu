import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { deadlines } from "@/drizzle/schema";
import Countdown from "./Countdown";
import { redirect } from "next/navigation";

interface HeaderProps {
  userId: string;
}

export default async function Header({ userId }: { userId: string }) {
  // Get user's deadline
  const userDeadlines = await db
    .select()
    .from(deadlines)
    .where(eq(deadlines.userId, userId));

  if (userDeadlines.length === 0) {
    redirect("/deadline");
  }

  const deadline = userDeadlines[0].deadline;
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Countdown Timer */}
          <Countdown deadline={deadline} />

          {/* Right side - Activity button and User profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/activity"
              className="px-3 py-1.5 text-sm font-medium text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              Activity
            </Link>

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
