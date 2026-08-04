"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

type NavLink = { href: string; label: string };

type MobileNavProps = {
  links: NavLink[];
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function MobileNav({
  links,
  isLoggedIn,
  onLogin,
  onLogout,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <SheetFooter>
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Se déconnecter
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOpen(false);
                onLogin();
              }}
            >
              Se connecter avec Google
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
