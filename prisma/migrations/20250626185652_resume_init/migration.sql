-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL,
    "sid" UUID NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "experienceNote" TEXT,
    "theme" "Theme" NOT NULL DEFAULT 'light',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentActivity" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "DevelopmentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "grade" TEXT,
    "issuer" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesirePosition" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL,
    "jid" UUID NOT NULL,

    CONSTRAINT "DesirePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ResumeSkills" (
    "A" TEXT NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ResumeSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResumeCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResumeCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResumePositions" (
    "A" UUID NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResumePositions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "UserSkill_uid_idx" ON "UserSkill"("uid");

-- CreateIndex
CREATE INDEX "UserSkill_sid_idx" ON "UserSkill"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_uid_sid_key" ON "UserSkill"("uid", "sid");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE INDEX "DesirePosition_uid_idx" ON "DesirePosition"("uid");

-- CreateIndex
CREATE INDEX "DesirePosition_jid_idx" ON "DesirePosition"("jid");

-- CreateIndex
CREATE UNIQUE INDEX "DesirePosition_uid_jid_key" ON "DesirePosition"("uid", "jid");

-- CreateIndex
CREATE INDEX "_ResumeSkills_B_index" ON "_ResumeSkills"("B");

-- CreateIndex
CREATE INDEX "_ResumeCategories_B_index" ON "_ResumeCategories"("B");

-- CreateIndex
CREATE INDEX "_ResumePositions_B_index" ON "_ResumePositions"("B");

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_uid_fkey" FOREIGN KEY ("uid") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_sid_fkey" FOREIGN KEY ("sid") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentActivity" ADD CONSTRAINT "DevelopmentActivity_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesirePosition" ADD CONSTRAINT "DesirePosition_uid_fkey" FOREIGN KEY ("uid") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesirePosition" ADD CONSTRAINT "DesirePosition_jid_fkey" FOREIGN KEY ("jid") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeSkills" ADD CONSTRAINT "_ResumeSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeSkills" ADD CONSTRAINT "_ResumeSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeCategories" ADD CONSTRAINT "_ResumeCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumeCategories" ADD CONSTRAINT "_ResumeCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumePositions" ADD CONSTRAINT "_ResumePositions_A_fkey" FOREIGN KEY ("A") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResumePositions" ADD CONSTRAINT "_ResumePositions_B_fkey" FOREIGN KEY ("B") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
