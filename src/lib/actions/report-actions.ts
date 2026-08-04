"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { earnCredits, TEST_REWARD } from "@/lib/credits";
import { AppStatus, CreditTransactionType } from "@/generated/prisma/enums";
import { testReportSchema, type TestReportInput } from "@/lib/validation";

export async function markReportUseful(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié." };
  }

  const report = await prisma.testReport.findUnique({
    where: { id: reportId },
    include: { app: true },
  });

  if (!report || report.app.ownerId !== session.user.id) {
    return { error: "Rapport introuvable." };
  }

  await prisma.testReport.update({
    where: { id: reportId },
    data: { markedUseful: !report.markedUseful },
  });

  revalidatePath(`/apps/${report.appId}`);
}

export async function submitTestReport(input: TestReportInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Vous devez être connecté pour soumettre un rapport." };
  }

  const data = testReportSchema.parse(input);
  const userId = session.user.id;

  const app = await prisma.app.findUnique({ where: { id: data.appId } });
  if (!app) {
    return { error: "App introuvable." };
  }
  if (app.ownerId === userId) {
    return { error: "Vous ne pouvez pas tester votre propre app." };
  }
  if (app.status === AppStatus.CLOSED) {
    return { error: "Cette app n'accepte plus de tests." };
  }

  const existing = await prisma.testReport.findUnique({
    where: { appId_testerId: { appId: data.appId, testerId: userId } },
  });
  if (existing) {
    return { error: "Vous avez déjà testé cette app." };
  }

  await prisma.$transaction(async (tx) => {
    const report = await tx.testReport.create({
      data: {
        appId: data.appId,
        testerId: userId,
        onboardingClarity: data.onboardingClarity,
        navigationEase: data.navigationEase,
        stabilityBugs: data.stabilityBugs,
        perceivedDesign: data.perceivedDesign,
        strengths: data.strengths,
        improvements: data.improvements,
        timeSpentMinutes: data.timeSpentMinutes,
        bugs: { create: data.bugs },
      },
    });

    await earnCredits(tx, {
      userId,
      amount: TEST_REWARD,
      type: CreditTransactionType.EARNED_TEST_REPORT,
      description: `Test de l'app "${app.name}"`,
      relatedAppId: app.id,
      relatedTestReportId: report.id,
    });

    if (app.status === AppStatus.WAITING_TESTERS) {
      await tx.app.update({
        where: { id: app.id },
        data: { status: AppStatus.IN_TESTING },
      });
    }
  });

  revalidatePath(`/apps/${data.appId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-tests");
  redirect(`/apps/${data.appId}`);
}
