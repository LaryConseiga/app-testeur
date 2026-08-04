import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, FlaskConical, Send } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [user, appsCount, testsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    }),
    prisma.app.count({ where: { ownerId: userId } }),
    prisma.testReport.count({ where: { testerId: userId } }),
  ]);

  const stats = [
    {
      label: "Solde de crédits",
      value: user?.creditBalance ?? 0,
      icon: Coins,
      href: "/dashboard/credits",
    },
    {
      label: "Apps publiées",
      value: appsCount,
      icon: Send,
      href: "/dashboard/my-apps",
    },
    {
      label: "Tests effectués",
      value: testsCount,
      icon: FlaskConical,
      href: "/dashboard/my-tests",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/apps/new">Publier une app</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Découvrir des apps à tester</Link>
        </Button>
      </div>
    </div>
  );
}
