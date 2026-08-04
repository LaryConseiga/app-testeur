import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { TestReportForm } from "@/components/test-report-form";

export default async function TestAppPage(
  props: PageProps<"/apps/[appId]/test">
) {
  const { appId } = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) notFound();

  if (app.ownerId === session.user.id) {
    redirect(`/apps/${appId}`);
  }
  if (app.status === AppStatus.CLOSED) {
    redirect(`/apps/${appId}`);
  }

  const existing = await prisma.testReport.findUnique({
    where: { appId_testerId: { appId, testerId: session.user.id } },
  });
  if (existing) {
    redirect(`/apps/${appId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href={`/apps/${appId}`}>
          <ArrowLeft />
          Retour à l&apos;app
        </Link>
      </Button>

      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tester {app.name}
        </h1>
        <p className="text-muted-foreground">
          Comptez environ 15 minutes. Soyez précis et concis : vos réponses
          seront directement visibles par le développeur.
        </p>
      </div>

      <TestReportForm appId={appId} />
    </div>
  );
}
