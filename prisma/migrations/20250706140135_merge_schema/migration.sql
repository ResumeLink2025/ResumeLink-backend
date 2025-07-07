-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_id_fkey";

-- DropIndex
DROP INDEX "UserProfile_id_idx";

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_id_fkey" FOREIGN KEY ("id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
