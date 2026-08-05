"use server";

import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { sendLoginCodeEmail } from "@/lib/email";
import { signIn, signOut } from "@/lib/auth";
import { isNextInternalSignal } from "@/lib/utils";
import {
  requestCodeSchema,
  loginSchema,
  type RequestCodeInput,
  type LoginInput,
} from "@/lib/validation";

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestLoginCode(input: RequestCodeInput) {
  const { email } = requestCodeSchema.parse(input);

  try {
    const recent = await prisma.loginCode.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      return {
        error: "Un code a déjà été envoyé. Patientez une minute avant d'en redemander un.",
      };
    }

    const code = generateCode();

    await prisma.loginCode.deleteMany({ where: { email } });
    await prisma.loginCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      },
    });

    await sendLoginCodeEmail(email, code);

    return { success: true };
  } catch (error) {
    if (isNextInternalSignal(error)) {
      throw error;
    }
    console.error("requestLoginCode failed:", error);
    return { error: "Impossible d'envoyer le code. Réessayez dans un instant." };
  }
}

export async function loginWithCredentials(input: LoginInput) {
  const data = loginSchema.parse(input);

  try {
    await signIn("credentials", {
      name: data.name,
      email: data.email,
      code: data.code,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Code invalide ou expiré." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
