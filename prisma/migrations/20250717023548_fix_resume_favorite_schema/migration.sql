-- DropForeignKey
ALTER TABLE "ResumeFavorite" DROP CONSTRAINT "ResumeFavorite_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeFavorite" DROP CONSTRAINT "ResumeFavorite_userId_fkey";

-- AddForeignKey
ALTER TABLE "ResumeFavorite" ADD CONSTRAINT "ResumeFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeFavorite" ADD CONSTRAINT "ResumeFavorite_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
