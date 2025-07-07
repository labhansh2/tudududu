import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Activity from "@/components/ActivityMap";
import SessionTimeline from "@/components/Timeline";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    year?: string;
    view?: string;
    date?: string;
  };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  const currentYear = new Date().toLocaleString("en-CA", {
    timeZone: timezone,
    year: "numeric",
  });

  const params = await searchParams;
  const selectedYear = params.year
    ? parseInt(params.year)
    : parseInt(currentYear);

  // Timeline search params
  const timelineView = (params.view as "day" | "week" | "month") || "week";
  const timelineDate =
    params.date || new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-4">
        <Activity
          selectedYear={selectedYear}
          currentYear={parseInt(currentYear)}
        />
        <SessionTimeline
          viewMode={timelineView}
          currentDate={timelineDate}
        />
      </div>
    </div>
  );
}
