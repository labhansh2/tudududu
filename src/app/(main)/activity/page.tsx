import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Activity from "@/components/ActivityMap";

export default async function Page({
  searchParams,
}: {
  searchParams: { year?: string };
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
  const selectedYear = params.year ? parseInt(params.year) : parseInt(currentYear);

  return (
    <div>
      <Activity selectedYear={selectedYear} currentYear={parseInt(currentYear)} />
    </div>
  );
}
