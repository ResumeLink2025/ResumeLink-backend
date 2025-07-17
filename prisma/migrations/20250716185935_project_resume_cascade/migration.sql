-- DropForeignKey
ALTER TABLE "ProjectResume" DROP CONSTRAINT "ProjectResume_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectResume" ADD CONSTRAINT "ProjectResume_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
