-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "ChatParticipant" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "status" "ChatRoomStatus" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_isVisible_idx" ON "ChatParticipant"("userId", "isVisible");

-- CreateIndex
CREATE INDEX "ChatRoom_status_idx" ON "ChatRoom"("status");
