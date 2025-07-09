import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  const currentDate = new Date().toLocaleString("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }); // en-CA already returns YYYY-MM-DD format

  const params = await searchParams;
  const timelineView = (params.view as "day" | "week" | "month") || "day";
  const timelineDate = params.date || currentDate;

  return (
    <div className="h-[calc(100vh-4rem)] px-2 sm:px-4 py-2">
      <Timeline
        viewMode={timelineView}
        currentDate={timelineDate}
        isFullHeight={true}
      />
    </div>
  );
}
