CREATE TYPE "public"."task_status" AS ENUM('active', 'not_active', 'completed');--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionid" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "work_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"total_hours" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_deadline_id_deadlines_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "status" "task_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "deadline_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "description";