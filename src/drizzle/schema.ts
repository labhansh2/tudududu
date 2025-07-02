import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const deadlines = pgTable("deadlines", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  deadline: timestamp("deadline").notNull(),
});

export const taskStatusEnum = pgEnum("task_status", [
  "active",
  "not_active",
  "completed",
]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: taskStatusEnum("status").notNull(),
});

export const sessions = pgTable("sessions", {
  sessionId: serial("sessionid").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  userId: text("user_id").notNull(),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
});

export const workTime = pgTable("work_time", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull(),
  total_seconds: integer("total_seconds").notNull(),
});
