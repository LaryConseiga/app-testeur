import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PUBLISH_COST } from "@/lib/credits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublishAppForm } from "@/components/publish-app-form";

export default async function NewAppPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creditBalance: true },
  });

  const balance = user?.creditBalance ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Publier une app à tester
        </h1>
        <p className="text-muted-foreground">
          La publication coûte {PUBLISH_COST} crédit. Votre solde actuel :{" "}
          <Badge variant={balance < PUBLISH_COST ? "destructive" : "secondary"}>
            {balance} crédit{balance === 1 ? "" : "s"}
          </Badge>
        </p>
      </div>

      {balance < PUBLISH_COST ? (
        <Card>
          <CardHeader>
            <CardTitle>Solde insuffisant</CardTitle>
            <CardDescription>
              Vous avez besoin d&apos;au moins {PUBLISH_COST} crédit pour
              publier une app. Testez une app d&apos;un autre développeur pour
              gagner des crédits.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <PublishAppForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
