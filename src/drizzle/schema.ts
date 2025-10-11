import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  integer,
  index,
  date,
  unique,
} from "drizzle-orm/pg-core";

export const deadlines = pgTable(
  "deadlines",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    deadline: timestamp("deadline", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => [index("deadline_user_id_idx").on(table.userId)],
);

export const taskStatusEnum = pgEnum("task_status", [
  "active",
  "not_active",
  "completed",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    status: taskStatusEnum("status").notNull(),
    deadline: timestamp("deadline", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (table) => [index("task_user_id_idx").on(table.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionId: serial("sessionid").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    startedAt: timestamp("started_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_task_id_idx").on(table.taskId),
  ],
);

export const workTime = pgTable(
  "work_time",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    total_seconds: integer("total_seconds").notNull(),
  },
  (table) => [
    index("work_time_user_id_idx").on(table.userId),
    unique("work_time_user_date_unique").on(table.userId, table.date),
  ],
);
