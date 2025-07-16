import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, toZonedTime } from "date-fns-tz";

import Timeline from "@/components/Timeline";

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
  const timelineView = (params.view as "day" | "week" | "month") || "day";
  const timelineDate = params.date || format(todayUserTz, "yyyy-MM-dd");

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Timeline
        viewMode={timelineView}
        paramsDateUserTz={timelineDate}
        isFullHeight={true}
        isFullPage={true}
      />
    </div>
  );
}
