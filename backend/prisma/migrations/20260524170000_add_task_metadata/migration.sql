-- CreateEnum
CREATE TYPE "TaskPriorityEnum" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "category" TEXT;
ALTER TABLE "tasks" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "priority" "TaskPriorityEnum" NOT NULL DEFAULT 'medium';
ALTER TABLE "tasks" ADD COLUMN "deadline" TIMESTAMP(3);
