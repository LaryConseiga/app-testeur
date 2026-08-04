import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bug,
  CalendarDays,
  Clock,
  ExternalLink,
  Flame,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStale } from "@/lib/apps";
import { PLATFORM_LABELS, RATING_QUESTIONS } from "@/lib/constants";
import { AppStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CloseAppButton } from "@/components/close-app-button";
import { MarkUsefulButton } from "@/components/mark-useful-button";

const STATUS_LABELS: Record<AppStatus, string> = {
  WAITING_TESTERS: "En attente de testeurs",
  IN_TESTING: "En cours de test",
  CLOSED: "Clôturée",
};

export default async function AppDetailPage(props: PageProps<"/apps/[appId]">) {
  const { appId } = await props.params;
  const session = await auth();

  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: {
      owner: { select: { id: true, name: true, image: true, school: true } },
      testReports: {
        include: {
          tester: { select: { name: true, image: true } },
          bugs: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!app) notFound();

  const userId = session?.user?.id;
  const isOwner = userId === app.ownerId;
  const myReport = userId
    ? app.testReports.find((r) => r.testerId === userId)
    : undefined;
  const canTest =
    !!userId && !isOwner && !myReport && app.status !== AppStatus.CLOSED;
  const stale = isStale(app);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {app.name}
            </h1>
            <Badge variant="outline">{PLATFORM_LABELS[app.platform]}</Badge>
            <Badge
              variant={app.status === "WAITING_TESTERS" ? "default" : "secondary"}
            >
              {STATUS_LABELS[app.status]}
            </Badge>
            {stale && (
              <Badge className="gap-1 border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <Flame className="size-3" />
                Priorité
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="size-6">
              <AvatarImage src={app.owner.image ?? undefined} />
              <AvatarFallback>{app.owner.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <span>{app.owner.name}</span>
            {app.owner.school && <span>· {app.owner.school}</span>}
            <span className="hidden items-center gap-1 sm:flex">
              <CalendarDays className="size-3.5" />
              {new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
              }).format(app.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isOwner && app.status !== AppStatus.CLOSED && (
            <CloseAppButton appId={app.id} />
          )}
          {canTest && (
            <Button asChild>
              <Link href={`/apps/${app.id}/test`}>Tester cette app</Link>
            </Button>
          )}
          {!userId && (
            <Button asChild>
              <Link href="/login">Se connecter pour tester</Link>
            </Button>
          )}
          {myReport && (
            <Badge variant="secondary" className="h-9 gap-1.5 px-3">
              <ThumbsUp className="size-3.5" />
              Vous avez déjà testé cette app
            </Badge>
          )}
          <Button variant="outline" asChild>
            <a href={app.accessUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Ouvrir le lien
            </a>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-5 pt-6">
          <p className="text-sm leading-relaxed">{app.description}</p>

          {app.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {app.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="font-normal">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Feedback recherché en priorité</p>
            <p className="text-sm text-muted-foreground">{app.feedbackFocus}</p>
            {app.feedbackTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {app.feedbackTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isOwner ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Rapports de test ({app.testReports.length})
          </h2>
          {app.testReports.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aucun rapport pour le moment. Votre app apparaît dans la liste de
              découverte des testeurs.
            </p>
          ) : (
            <div className="space-y-4">
              {app.testReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={report.tester.image ?? undefined} />
                        <AvatarFallback>
                          {report.tester.name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-sm font-medium">
                        {report.tester.name}
                      </CardTitle>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {report.timeSpentMinutes} min
                      </span>
                    </div>
                    <MarkUsefulButton
                      reportId={report.id}
                      markedUseful={report.markedUseful}
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {RATING_QUESTIONS.map((q) => (
                        <div key={q.key} className="rounded-md border p-2.5">
                          <p className="text-xs text-muted-foreground">
                            {q.label}
                          </p>
                          <p className="text-lg font-semibold">
                            {report[q.key]}
                            <span className="text-xs font-normal text-muted-foreground">
                              /5
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <ThumbsUp className="size-3.5" />
                          Points forts
                        </p>
                        <p className="text-sm">{report.strengths}</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                          <ThumbsDown className="size-3.5" />
                          Points à améliorer
                        </p>
                        <p className="text-sm">{report.improvements}</p>
                      </div>
                    </div>

                    {report.bugs.length > 0 && (
                      <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium">
                          <Bug className="size-3.5" />
                          Bugs rencontrés ({report.bugs.length})
                        </p>
                        <ul className="space-y-1.5">
                          {report.bugs.map((bug) => (
                            <li
                              key={bug.id}
                              className="rounded-md bg-muted p-2.5 text-sm"
                            >
                              <span className="font-medium">{bug.title}</span>
                              {" — "}
                              <span className="text-muted-foreground">
                                {bug.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {app.testReports.length} rapport
          {app.testReports.length === 1 ? "" : "s"} de test reçu
          {app.testReports.length === 1 ? "" : "s"}. Les rapports détaillés
          sont visibles par le propriétaire de l&apos;app.
        </p>
      )}
    </div>
  );
}
