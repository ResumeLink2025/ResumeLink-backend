/*
  Warnings:

  - A unique constraint covering the columns `[authProviderId]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authProvider,authProviderId]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_authProviderId_key" ON "UserAuth"("authProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_authProvider_authProviderId_key" ON "UserAuth"("authProvider", "authProviderId");
