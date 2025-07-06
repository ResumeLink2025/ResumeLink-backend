-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google', 'kakao');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('employed', 'unemployed');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "CoffeeChatStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'local',
    "authProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "nickname" TEXT NOT NULL,
    "birthday" DATE NOT NULL,
    "gender" "Gender",
    "customSkill" JSONB,
    "customInterest" JSONB,
    "customPosition" JSONB,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "employmentStatus" "EmploymentStatus",
    "imageUrl" TEXT,
    "summary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesirePosition" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,

    CONSTRAINT "DesirePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "experienceNote" TEXT,
    "theme" "Theme" NOT NULL DEFAULT 'light',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "categories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumePosition" (
    "id" TEXT NOT NULL,
    "resumeId" UUID NOT NULL,
    "positionId" UUID NOT NULL,

    CONSTRAINT "ResumePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "resumeId" UUID NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentActivity" (
    "id" TEXT NOT NULL,
    "resumeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "description" TEXT,

    CONSTRAINT "DevelopmentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "resumeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE,
    "grade" TEXT,
    "issuer" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectResume" (
    "id" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "aiDescription" TEXT NOT NULL,

    CONSTRAINT "ProjectResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "projectNumber" SERIAL NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDesc" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "role" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "customSkills" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSkill" (
    "id" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeChat" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "CoffeeChatStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "CoffeeChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" UUID NOT NULL,
    "coffeeChatId" UUID NOT NULL,
    "status" "ChatRoomStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" UUID NOT NULL,
    "chatRoomId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lastReadMessageId" UUID,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "chatRoomId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "text" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_authProviderId_key" ON "UserAuth"("authProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_authProvider_authProviderId_key" ON "UserAuth"("authProvider", "authProviderId");

-- CreateIndex
CREATE INDEX "UserProfile_id_idx" ON "UserProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");

-- CreateIndex
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");

-- CreateIndex
CREATE INDEX "DesirePosition_userId_idx" ON "DesirePosition"("userId");

-- CreateIndex
CREATE INDEX "DesirePosition_jobId_idx" ON "DesirePosition"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "DesirePosition_userId_jobId_key" ON "DesirePosition"("userId", "jobId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "Resume"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_updatedAt_idx" ON "Resume"("updatedAt");

-- CreateIndex
CREATE INDEX "ResumePosition_resumeId_idx" ON "ResumePosition"("resumeId");

-- CreateIndex
CREATE INDEX "ResumePosition_positionId_idx" ON "ResumePosition"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumePosition_resumeId_positionId_key" ON "ResumePosition"("resumeId", "positionId");

-- CreateIndex
CREATE INDEX "ResumeSkill_resumeId_idx" ON "ResumeSkill"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeSkill_skillId_idx" ON "ResumeSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSkill_resumeId_skillId_key" ON "ResumeSkill"("resumeId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectResume_resumeId_projectId_key" ON "ProjectResume"("resumeId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNumber_key" ON "Project"("projectNumber");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Project_updatedAt_idx" ON "Project"("updatedAt");

-- CreateIndex
CREATE INDEX "ProjectSkill_skillId_idx" ON "ProjectSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSkill_projectId_skillId_key" ON "ProjectSkill"("projectId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_projectId_key" ON "Favorite"("userId", "projectId");

-- CreateIndex
CREATE INDEX "CoffeeChat_requesterId_idx" ON "CoffeeChat"("requesterId");

-- CreateIndex
CREATE INDEX "CoffeeChat_receiverId_idx" ON "CoffeeChat"("receiverId");

-- CreateIndex
CREATE INDEX "CoffeeChat_status_idx" ON "CoffeeChat"("status");

-- CreateIndex
CREATE INDEX "CoffeeChat_requesterId_receiverId_idx" ON "CoffeeChat"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_coffeeChatId_key" ON "ChatRoom"("coffeeChatId");

-- CreateIndex
CREATE INDEX "ChatRoom_createdAt_idx" ON "ChatRoom"("createdAt");

-- CreateIndex
CREATE INDEX "ChatRoom_status_idx" ON "ChatRoom"("status");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "ChatParticipant"("userId");

-- CreateIndex
CREATE INDEX "ChatParticipant_chatRoomId_idx" ON "ChatParticipant"("chatRoomId");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_leftAt_idx" ON "ChatParticipant"("userId", "leftAt");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_isVisible_idx" ON "ChatParticipant"("userId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_chatRoomId_userId_key" ON "ChatParticipant"("chatRoomId", "userId");

-- CreateIndex
CREATE INDEX "Message_chatRoomId_createdAt_idx" ON "Message"("chatRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_chatRoomId_isDeleted_createdAt_idx" ON "Message"("chatRoomId", "isDeleted", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_isDeleted_idx" ON "Message"("isDeleted");

-- CreateIndex
CREATE INDEX "Message_chatRoomId_isDeleted_idx" ON "Message"("chatRoomId", "isDeleted");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_id_fkey" FOREIGN KEY ("id") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesirePosition" ADD CONSTRAINT "DesirePosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesirePosition" ADD CONSTRAINT "DesirePosition_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePosition" ADD CONSTRAINT "ResumePosition_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePosition" ADD CONSTRAINT "ResumePosition_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentActivity" ADD CONSTRAINT "DevelopmentActivity_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResume" ADD CONSTRAINT "ProjectResume_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResume" ADD CONSTRAINT "ProjectResume_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSkill" ADD CONSTRAINT "ProjectSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeChat" ADD CONSTRAINT "CoffeeChat_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeChat" ADD CONSTRAINT "CoffeeChat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_coffeeChatId_fkey" FOREIGN KEY ("coffeeChatId") REFERENCES "CoffeeChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_lastReadMessageId_fkey" FOREIGN KEY ("lastReadMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
