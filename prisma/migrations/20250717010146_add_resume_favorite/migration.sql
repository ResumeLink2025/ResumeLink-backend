-- CreateTable
CREATE TABLE "ResumeFavorite" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "resumeId" UUID NOT NULL,

    CONSTRAINT "ResumeFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeFavorite_userId_resumeId_key" ON "ResumeFavorite"("userId", "resumeId");

-- AddForeignKey
ALTER TABLE "ResumeFavorite" ADD CONSTRAINT "ResumeFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeFavorite" ADD CONSTRAINT "ResumeFavorite_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
