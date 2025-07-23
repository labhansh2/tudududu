import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, toZonedTime } from "date-fns-tz";

import Timeline from "@/components/Timeline";
import { View } from "@/components/Timeline/types";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
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
  const timelineView = (params.view as View) || View.DAY;
  const timelineDate = params.date || format(todayUserTz, "yyyy-MM-dd");

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Timeline
        isFullHeight={true}
        isFullPage={true}
        viewMode={timelineView}
        paramsDateUserTz={timelineDate}
        timezone={timezone}
      />
    </div>
  );
}
