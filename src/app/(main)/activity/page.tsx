import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, toZonedTime } from "date-fns-tz";

import Activity from "@/components/ActivityMap";
import Timeline from "@/components/Timeline";
import { View } from "@/components/Timeline/types";

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
    <div className="h-full overflow-hidden">
      <div className="flex flex-col h-full gap-2 px-3 py-2">
        <div className="flex-shrink-0">
          <Activity
            selectedYear={selectedYear}
            currentYear={parseInt(format(todayUserTz, "yyyy"))}
            searchParams={params}
          />
        </div>

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
  );
}
