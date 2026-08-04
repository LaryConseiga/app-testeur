"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  InsufficientCreditsError,
  PUBLISH_COST,
  spendCredits,
} from "@/lib/credits";
import { CreditTransactionType, AppStatus } from "@/generated/prisma/enums";
import { publishAppSchema, type PublishAppInput } from "@/lib/validation";

export async function createApp(input: PublishAppInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Vous devez être connecté pour publier une app." };
  }

  const data = publishAppSchema.parse(input);
  const userId = session.user.id;

  let appId: string;
  try {
    appId = await prisma.$transaction(async (tx) => {
      const app = await tx.app.create({
        data: {
          name: data.name,
          description: data.description,
          accessUrl: data.accessUrl,
          platform: data.platform,
          techStack: data.techStack,
          feedbackFocus: data.feedbackFocus,
          feedbackTags: data.feedbackTags,
          ownerId: userId,
        },
      });

      await spendCredits(tx, {
        userId,
        amount: PUBLISH_COST,
        type: CreditTransactionType.SPENT_APP_PUBLISH,
        description: `Publication de l'app "${app.name}"`,
        relatedAppId: app.id,
      });

      return app.id;
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/apps/${appId}`);
}

export async function closeApp(appId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié." };
  }

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app || app.ownerId !== session.user.id) {
    return { error: "App introuvable." };
  }

  await prisma.app.update({
    where: { id: appId },
    data: { status: AppStatus.CLOSED, closedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath(`/apps/${appId}`);
  revalidatePath("/dashboard/my-apps");
}
