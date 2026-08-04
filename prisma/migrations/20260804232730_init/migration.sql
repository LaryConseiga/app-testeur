-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'IOS', 'ANDROID');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('WAITING_TESTERS', 'IN_TESTING', 'CLOSED');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('WELCOME_BONUS', 'EARNED_TEST_REPORT', 'SPENT_APP_PUBLISH', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_CONTENT', 'BROKEN_LINK', 'SPAM', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "school" TEXT,
    "techStack" TEXT[],
    "portfolioUrl" TEXT,
    "creditBalance" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accessUrl" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "techStack" TEXT[],
    "feedbackFocus" TEXT NOT NULL,
    "feedbackTags" TEXT[],
    "status" "AppStatus" NOT NULL DEFAULT 'WAITING_TESTERS',
    "closedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appId" TEXT NOT NULL,
    "testerId" TEXT NOT NULL,
    "onboardingClarity" INTEGER NOT NULL,
    "navigationEase" INTEGER NOT NULL,
    "stabilityBugs" INTEGER NOT NULL,
    "perceivedDesign" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "timeSpentMinutes" INTEGER NOT NULL,
    "markedUseful" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TestReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BugEntry" (
    "id" TEXT NOT NULL,
    "testReportId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "BugEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "relatedAppId" TEXT,
    "relatedTestReportId" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "App_status_createdAt_idx" ON "App"("status", "createdAt");

-- CreateIndex
CREATE INDEX "App_ownerId_idx" ON "App"("ownerId");

-- CreateIndex
CREATE INDEX "TestReport_appId_idx" ON "TestReport"("appId");

-- CreateIndex
CREATE INDEX "TestReport_testerId_idx" ON "TestReport"("testerId");

-- CreateIndex
CREATE UNIQUE INDEX "TestReport_appId_testerId_key" ON "TestReport"("appId", "testerId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_relatedTestReportId_key" ON "CreditTransaction"("relatedTestReportId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugEntry" ADD CONSTRAINT "BugEntry_testReportId_fkey" FOREIGN KEY ("testReportId") REFERENCES "TestReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_relatedTestReportId_fkey" FOREIGN KEY ("relatedTestReportId") REFERENCES "TestReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
