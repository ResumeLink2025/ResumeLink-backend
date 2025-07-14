-- DropForeignKey
ALTER TABLE "ProjectSkill" DROP CONSTRAINT "ProjectSkill_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectSkill" DROP CONSTRAINT "ProjectSkill_skillId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
