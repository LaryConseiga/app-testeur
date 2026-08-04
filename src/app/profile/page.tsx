import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, GraduationCap, Pencil } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Mon profil
        </h1>
        <Button variant="outline" asChild>
          <Link href="/profile/edit">
            <Pencil />
            Modifier
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="text-lg">
                {user.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {user.school && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="size-4 text-muted-foreground" />
              {user.school}
            </div>
          )}

          {user.techStack.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm font-medium">Stack technique</p>
              <div className="flex flex-wrap gap-1.5">
                {user.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="font-normal">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.portfolioUrl && (
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              {user.portfolioUrl}
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
