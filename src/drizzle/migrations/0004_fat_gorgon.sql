ALTER TABLE "work_hours" RENAME TO "work_time";--> statement-breakpoint
ALTER TABLE "work_time" RENAME COLUMN "total_hours" TO "total_seconds";