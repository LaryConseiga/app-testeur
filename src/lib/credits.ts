import { Prisma, CreditTransactionType } from "@/generated/prisma/client";

export const WELCOME_CREDITS = 3;
export const PUBLISH_COST = 1;
export const TEST_REWARD = 1;

export class InsufficientCreditsError extends Error {
  constructor(balance: number, required: number) {
    super(
      `Solde de crédits insuffisant : ${balance} disponible(s), ${required} requis.`
    );
    this.name = "InsufficientCreditsError";
  }
}

export async function spendCredits(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description: string;
    relatedAppId?: string;
  }
) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: params.userId },
    select: { creditBalance: true },
  });

  if (user.creditBalance < params.amount) {
    throw new InsufficientCreditsError(user.creditBalance, params.amount);
  }

  await tx.user.update({
    where: { id: params.userId },
    data: { creditBalance: { decrement: params.amount } },
  });

  await tx.creditTransaction.create({
    data: {
      userId: params.userId,
      amount: -params.amount,
      type: params.type,
      description: params.description,
      relatedAppId: params.relatedAppId,
    },
  });
}

export async function earnCredits(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description: string;
    relatedAppId?: string;
    relatedTestReportId?: string;
  }
) {
  await tx.user.update({
    where: { id: params.userId },
    data: { creditBalance: { increment: params.amount } },
  });

  await tx.creditTransaction.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      type: params.type,
      description: params.description,
      relatedAppId: params.relatedAppId,
      relatedTestReportId: params.relatedTestReportId,
    },
  });
}
