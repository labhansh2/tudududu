import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { db } from "@/drizzle";
import { workTime } from "@/drizzle/schema";
import { lte, gte, eq, sql, and, asc } from "drizzle-orm";
import { getLevel } from "@/utils";

export async function getAvailableYears() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return db
    .selectDistinct({
      year: sql<number>`EXTRACT(YEAR FROM ${workTime.date})::integer`,
    })
    .from(workTime)
    .where(eq(workTime.userId, userId));
}

export async function getActivityData(startDate: string, endDate: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const cookieStore = await cookies();
  const timezone = cookieStore.get("timezone")?.value;

  const data = await db
    .select({
      date: workTime.date,
      total_seconds: workTime.total_seconds,
    })
    .from(workTime)
    .where(
      and(
        eq(workTime.userId, userId),
        gte(workTime.date, startDate),
        lte(workTime.date, endDate),
      ),
    )
    .orderBy(asc(workTime.date));


  // this is sorta sloppy but it works
  // clean this up later if you want
  const bounds = [
    {
      date: startDate,
      total_seconds: 0,
      level: 0,
    },
    {
      date: endDate,
      total_seconds: 0,
      level: 0,
    },
  ];

  if (data.length === 0) {
    return bounds;
  }

  const res = [
    bounds[0],
    ...data.map((row) => ({
      date: row.date,
      total_seconds: row.total_seconds,
      level: getLevel(row.total_seconds),
    })),
    bounds[1],
  ];

  if (res[0].date === res[1].date) {
    res.shift();
  }

  if (res[res.length - 1].date === res[res.length - 2].date) {
    res.pop();
  }

  return res;
}
