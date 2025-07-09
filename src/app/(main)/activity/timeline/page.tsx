import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import SessionTimeline from "@/components/Timeline";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: {
    view?: string;
    date?: string;
  };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const timelineView = (params.view as "day" | "week" | "month") || "day";
  const timelineDate =
    params.date || new Date().toISOString().split("T")[0];

  return (
    <div className="h-[calc(100vh-4rem)] px-2 sm:px-4 py-2">
      <SessionTimeline
        viewMode={timelineView}
        currentDate={timelineDate}
        isFullHeight={true}
      />
    </div>
  );
}
