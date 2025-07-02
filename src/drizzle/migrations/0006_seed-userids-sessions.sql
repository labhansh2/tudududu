-- Custom SQL migration file, put your code below! --
-- Add user_id to sessions table
UPDATE "sessions" 
SET "user_id" = "tasks"."user_id"
FROM "tasks"
WHERE "sessions"."task_id" = "tasks"."id";