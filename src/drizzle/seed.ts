import { db } from ".";
import { tasks } from "./schema";

export const seed = async () => {
  await db.insert(tasks).values({
    userId: "1",
    name: "Test Task",
    status: "active",
    test: "test",
  });
};

seed();
