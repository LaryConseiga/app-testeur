import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";

export default async function EditProfilePage() {
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
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Modifier mon profil
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProfileForm
            defaultValues={{
              name: user.name ?? "",
              school: user.school ?? "",
              techStack: user.techStack,
              portfolioUrl: user.portfolioUrl ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
