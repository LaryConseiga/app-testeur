"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema, type LoginInput } from "@/lib/validation";

export async function loginWithCredentials(input: LoginInput) {
  const data = loginSchema.parse(input);

  try {
    await signIn("credentials", {
      name: data.name,
      email: data.email,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Impossible de se connecter. Réessayez." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
