import Link from "next/link";
import { Flame, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORM_LABELS } from "@/lib/constants";
import { isStale } from "@/lib/apps";
import { AppStatus } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<AppStatus, string> = {
  WAITING_TESTERS: "En attente de testeurs",
  IN_TESTING: "En cours de test",
  CLOSED: "Clôturée",
};

type AppCardApp = {
  id: string;
  name: string;
  description: string;
  platform: keyof typeof PLATFORM_LABELS;
  techStack: string[];
  status: AppStatus;
  createdAt: Date;
  feedbackFocus: string;
  owner: { name: string | null; image: string | null };
  _count: { testReports: number };
};

export function AppCard({ app }: { app: AppCardApp }) {
  const stale = isStale(app);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{app.name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {app.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Badge variant="outline">{PLATFORM_LABELS[app.platform]}</Badge>
          <Badge variant={app.status === "WAITING_TESTERS" ? "default" : "secondary"}>
            {STATUS_LABELS[app.status]}
          </Badge>
          {stale && (
            <Badge className="gap-1 border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Flame className="size-3" />
              Priorité
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {app.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {app.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-normal">
                {tech}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Feedback recherché :
          </span>{" "}
          {app.feedbackFocus}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquareText className="size-3.5" />
          {app._count.testReports} test{app._count.testReports === 1 ? "" : "s"}
        </span>
        <Button asChild size="sm">
          <Link href={`/apps/${app.id}`}>Voir l&apos;app</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
