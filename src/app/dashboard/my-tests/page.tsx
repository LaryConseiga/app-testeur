import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, ThumbsUp } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function MyTestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const reports = await prisma.testReport.findMany({
    where: { testerId: userId },
    include: { app: { select: { id: true, name: true, platform: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium">Aucun test effectué</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Testez une app pour gagner des crédits et faire tester la vôtre en
          retour.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/">Découvrir des apps à tester</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const average = (
          (report.onboardingClarity +
            report.navigationEase +
            report.stabilityBugs +
            report.perceivedDesign) /
          4
        ).toFixed(1);

        return (
          <Card key={report.id}>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Link
                  href={`/apps/${report.app.id}`}
                  className="font-medium hover:underline"
                >
                  {report.app.name}
                </Link>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {report.timeSpentMinutes} min
                  </span>
                  <span>Note moyenne : {average}/5</span>
                  {report.markedUseful && (
                    <Badge variant="secondary" className="gap-1">
                      <ThumbsUp className="size-3" />
                      Jugé utile par le développeur
                    </Badge>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                }).format(report.createdAt)}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
