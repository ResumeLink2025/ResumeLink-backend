/*
  Warnings:

  - Made the column `coffeeChatId` on table `ChatRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_coffeeChatId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" ALTER COLUMN "coffeeChatId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_coffeeChatId_fkey" FOREIGN KEY ("coffeeChatId") REFERENCES "CoffeeChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
