import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, toZonedTime } from "date-fns-tz";

import Activity from "@/components/ActivityMap";
import HourlyActivityGraph from "@/components/AverageGraph";
import Timeline from "@/components/Timeline";
import { View } from "@/components/Timeline/types";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    view?: string;
    date?: string;
    range?: string;
    viewMode?: string;
  }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  if (!timezone) {
    redirect("/");
  }

  const todayUserTz = toZonedTime(new Date(), timezone);

  const params = await searchParams;

  // parse params for activity map
  const selectedYear = params.year
    ? parseInt(params.year)
    : parseInt(format(todayUserTz, "yyyy"));

  // parse params for timeline
  const timelineView = (params.view as View) || View.DAY;
  const timelineDate = params.date || format(todayUserTz, "yyyy-MM-dd");

  return (
    <>
      {/* Desktop: Fixed height layout */}
      <div className="hidden lg:flex h-full overflow-hidden">
        <div className="flex flex-col h-full gap-2 px-3 py-2 w-full">
          {/* Top section: Activity Map and Hourly Graph */}
          <div className="flex-shrink-0 flex gap-2 h-[260px] min-w-0">
            {/* Activity Map */}
            <div className="flex-1 min-w-0 h-full">
              <Activity
                selectedYear={selectedYear}
                currentYear={parseInt(format(todayUserTz, "yyyy"))}
                searchParams={params}
              />
            </div>

            {/* Hourly Activity Graph */}
            <div className="flex-1 min-w-0 h-full">
              <HourlyActivityGraph searchParams={params} />
            </div>
          </div>

          {/* Bottom section: Timeline */}
          <div className="flex-1 min-h-0">
            <Timeline
              isFullHeight={true}
              isFullPage={false}
              viewMode={timelineView}
              paramsDateUserTz={timelineDate}
              timezone={timezone}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Scrollable layout */}
      <div className="lg:hidden h-full overflow-y-scroll">
        <div className="flex flex-col gap-2 px-3 py-2 pb-4">
          {/* Activity Map */}
          <Activity
            selectedYear={selectedYear}
            currentYear={parseInt(format(todayUserTz, "yyyy"))}
            searchParams={params}
          />

          {/* Hourly Activity Graph */}
          <div className="h-[320px]">
            <HourlyActivityGraph searchParams={params} />
          </div>

          {/* Timeline */}
          <div style={{ height: "600px" }}>
            <Timeline
              isFullHeight={true}
              isFullPage={false}
              viewMode={timelineView}
              paramsDateUserTz={timelineDate}
              timezone={timezone}
            />
          </div>
        </div>
      </div>
    </>
  );
}
