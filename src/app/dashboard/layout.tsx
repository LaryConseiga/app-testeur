import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DashboardTabs } from "@/components/dashboard-tabs";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Dashboard
      </h1>
      <DashboardTabs />
      <div className="pt-6">{children}</div>
    </div>
  );
}
