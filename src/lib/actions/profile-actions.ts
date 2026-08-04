"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, type ProfileInput } from "@/lib/validation";

export async function updateProfile(input: ProfileInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non authentifié." };
  }

  const data = profileSchema.parse(input);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      school: data.school || null,
      techStack: data.techStack,
      portfolioUrl: data.portfolioUrl || null,
    },
  });

  revalidatePath("/profile");
  redirect("/profile");
}
