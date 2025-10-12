import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import TaskList from "@/components/Tasks";
import { getTasksWithStatsAndSparkline } from "@/components/Tasks/actions";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all tasks with stats and sparkline data in a single call
  const tasksWithStatsAndSparkline = await getTasksWithStatsAndSparkline();

  return (
    <div className="h-full overflow-y-auto">
      <TaskList initialTasks={tasksWithStatsAndSparkline} />
    </div>
  );
}
