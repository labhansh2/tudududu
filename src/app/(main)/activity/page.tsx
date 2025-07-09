import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Activity from "@/components/ActivityMap";
import Timeline from "@/components/Timeline";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    view?: string;
    date?: string;
  }>;
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

  const currentDate = new Date().toLocaleString("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }); // en-CA already returns YYYY-MM-DD format

  // params for activity map
  const params = await searchParams;
  const selectedYear = params.year
    ? parseInt(params.year)
    : parseInt(currentYear);

  // params for timeline
  const timelineView = (params.view as "day" | "week" | "month") || "day";
  const timelineDate = params.date || currentDate;

  return (
    <div className="mx-auto px-2 sm:px-4 py-2 h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full gap-2">
        <div className="flex-shrink-0">
          <Activity
            selectedYear={selectedYear}
            currentYear={parseInt(currentYear)}
            searchParams={params}
          />
        </div>

        <div className="flex-1 min-h-0 sm:flex-1 sm:min-h-0">
          <Timeline
            viewMode={timelineView}
            currentDate={timelineDate}
            isFullHeight={true}
            isFullPage={false}
          />
        </div>
      </div>
    </div>
  );
}
