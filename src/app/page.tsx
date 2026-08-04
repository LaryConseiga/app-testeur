import { Suspense } from "react";

import { getAllTechStacks, getDiscoveryApps } from "@/lib/apps";
import { Platform } from "@/generated/prisma/enums";
import { AppCard } from "@/components/app-card";
import { DiscoveryFilters } from "@/components/discovery-filters";

export default async function DiscoveryPage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;

  const platformParam =
    typeof searchParams.platform === "string" ? searchParams.platform : undefined;
  const techParam =
    typeof searchParams.tech === "string" ? searchParams.tech : undefined;

  const platform =
    platformParam && platformParam in Platform
      ? (platformParam as Platform)
      : undefined;

  const [apps, techStacks] = await Promise.all([
    getDiscoveryApps({ platform, techStack: techParam }),
    getAllTechStacks(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Découvrir des apps à tester
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Choisissez une app à tester et gagnez des crédits pour faire tester
          la vôtre en retour. Les apps en attente depuis plus de 5 jours
          remontent en priorité.
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <DiscoveryFilters techStacks={techStacks} />
        </Suspense>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <p className="text-lg font-medium">Aucune app pour le moment</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Essayez d&apos;ajuster les filtres, ou revenez plus tard : de
            nouvelles apps sont publiées régulièrement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
