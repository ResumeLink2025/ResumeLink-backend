-- CreateEnum
CREATE TYPE "DiaryStatus" AS ENUM ('TEMP', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Emotion" (
    "id" INTEGER NOT NULL,
    "emotion" TEXT NOT NULL,
    "color_code" TEXT NOT NULL,

    CONSTRAINT "Emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diary" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "img" TEXT,
    "email" TEXT NOT NULL,
    "emotionId" INTEGER NOT NULL,
    "status" "DiaryStatus" NOT NULL,

    CONSTRAINT "Diary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
