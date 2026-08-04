import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  WELCOME_BONUS: "Crédit de bienvenue",
  EARNED_TEST_REPORT: "Test effectué",
  SPENT_APP_PUBLISH: "Publication d'app",
  ADMIN_ADJUSTMENT: "Ajustement",
};

export default async function CreditsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    }),
    prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Solde actuel
          </CardTitle>
          <Coins className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">
            {user?.creditBalance ?? 0} crédit
            {(user?.creditBalance ?? 0) === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Historique des transactions
        </h2>
        {transactions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aucune transaction pour le moment.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      "flex flex-col gap-1 p-3 sm:table-row sm:gap-0",
                      i !== transactions.length - 1 && "border-b"
                    )}
                  >
                    <td className="sm:w-10 sm:p-3">
                      {tx.amount > 0 ? (
                        <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="size-4 text-orange-600 dark:text-orange-400" />
                      )}
                    </td>
                    <td className="sm:p-3">
                      <p className="font-medium">
                        {TYPE_LABELS[tx.type] ?? tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description}
                      </p>
                    </td>
                    <td className="sm:p-3 sm:text-right">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          tx.amount > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-orange-600 dark:text-orange-400"
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground sm:w-32 sm:p-3 sm:text-right">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                      }).format(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
