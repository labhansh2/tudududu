ALTER TABLE "tasks" ADD COLUMN "test" text;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_user_id_unique" UNIQUE("user_id");