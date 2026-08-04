import { prisma } from "@/lib/prisma";
import { AppStatus, Platform } from "@/generated/prisma/enums";

export const STALE_THRESHOLD_DAYS = 5;

export function isStale(app: { status: AppStatus; createdAt: Date }) {
  if (app.status !== AppStatus.WAITING_TESTERS) return false;
  const ageMs = Date.now() - app.createdAt.getTime();
  return ageMs > STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

export async function getDiscoveryApps(params: {
  platform?: Platform;
  techStack?: string;
  excludeUserId?: string;
}) {
  const apps = await prisma.app.findMany({
    where: {
      status: { in: [AppStatus.WAITING_TESTERS, AppStatus.IN_TESTING] },
      ...(params.platform ? { platform: params.platform } : {}),
      ...(params.techStack ? { techStack: { has: params.techStack } } : {}),
      ...(params.excludeUserId
        ? { ownerId: { not: params.excludeUserId } }
        : {}),
    },
    include: {
      owner: { select: { name: true, image: true } },
      _count: { select: { testReports: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apps.sort((a, b) => {
    const aStale = isStale(a) ? 1 : 0;
    const bStale = isStale(b) ? 1 : 0;
    if (aStale !== bStale) return bStale - aStale;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export async function getAllTechStacks() {
  const apps = await prisma.app.findMany({ select: { techStack: true } });
  const set = new Set<string>();
  for (const app of apps) {
    for (const tech of app.techStack) set.add(tech);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
