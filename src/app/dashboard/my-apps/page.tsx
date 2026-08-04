import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquareText } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLATFORM_LABELS } from "@/lib/constants";
import { isStale } from "@/lib/apps";
import { AppStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloseAppButton } from "@/components/close-app-button";

const STATUS_LABELS: Record<AppStatus, string> = {
  WAITING_TESTERS: "En attente de testeurs",
  IN_TESTING: "En cours de test",
  CLOSED: "Clôturée",
};

export default async function MyAppsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const apps = await prisma.app.findMany({
    where: { ownerId: userId },
    include: { _count: { select: { testReports: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium">Aucune app publiée</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Publiez votre première app pour commencer à recevoir des retours.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/apps/new">Publier une app</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <Card key={app.id}>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/apps/${app.id}`}
                  className="font-medium hover:underline"
                >
                  {app.name}
                </Link>
                <Badge variant="outline">{PLATFORM_LABELS[app.platform]}</Badge>
                <Badge
                  variant={
                    app.status === "WAITING_TESTERS" ? "default" : "secondary"
                  }
                >
                  {STATUS_LABELS[app.status]}
                </Badge>
                {isStale(app) && (
                  <Badge className="border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400">
                    Priorité
                  </Badge>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageSquareText className="size-3.5" />
                {app._count.testReports} rapport
                {app._count.testReports === 1 ? "" : "s"} reçu
                {app._count.testReports === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {app.status !== "CLOSED" && <CloseAppButton appId={app.id} />}
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/apps/${app.id}`}>Voir les rapports</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
