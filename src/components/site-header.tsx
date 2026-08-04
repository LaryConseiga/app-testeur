import Link from "next/link";
import { Coins, FlaskConical } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";

const NAV_LINKS = [
  { href: "/", label: "Découvrir" },
  { href: "/apps/new", label: "Publier une app" },
  { href: "/dashboard", label: "Dashboard" },
];

export async function SiteHeader() {
  const session = await auth();

  let creditBalance: number | null = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditBalance: true },
    });
    creditBalance = user?.creditBalance ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FlaskConical className="size-4" />
            </span>
            <span className="hidden sm:inline">TestSwap</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Badge
                variant="secondary"
                className="hidden gap-1.5 sm:inline-flex"
              >
                <Coins className="size-3.5 text-primary" />
                {creditBalance} crédit{creditBalance === 1 ? "" : "s"}
              </Badge>
              <ThemeToggle />
              <div className="hidden md:block">
                <UserMenu
                  name={session.user.name}
                  email={session.user.email}
                  image={session.user.image}
                  onLogout={logout}
                />
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button size="sm" className="hidden md:inline-flex" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </>
          )}
          <MobileNav
            links={NAV_LINKS}
            isLoggedIn={!!session?.user}
            onLogout={logout}
          />
        </div>
      </div>
    </header>
  );
}
