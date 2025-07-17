-- DropForeignKey
ALTER TABLE "ProjectFavorite" DROP CONSTRAINT "ProjectFavorite_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectFavorite" DROP CONSTRAINT "ProjectFavorite_userId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectFavorite" ADD CONSTRAINT "ProjectFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFavorite" ADD CONSTRAINT "ProjectFavorite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
