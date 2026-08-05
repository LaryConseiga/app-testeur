import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { WELCOME_CREDITS } from "@/lib/credits";
import { CreditTransactionType } from "@/generated/prisma/enums";
import { loginSchema } from "@/lib/validation";
import { isNextInternalSignal } from "@/lib/utils";

const { handlers, auth: rawAuth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        name: { label: "Nom", type: "text" },
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { name, email, code } = parsed.data;

        try {
          const loginCode = await prisma.loginCode.findFirst({
            where: { email, code, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" },
          });
          if (!loginCode) return null;

          await prisma.loginCode.deleteMany({ where: { email } });

          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) {
            return {
              id: existing.id,
              name: existing.name,
              email: existing.email,
              image: existing.image,
            };
          }

          const created = await prisma.user.create({
            data: { name, email },
          });

          await prisma.creditTransaction.create({
            data: {
              userId: created.id,
              amount: WELCOME_CREDITS,
              type: CreditTransactionType.WELCOME_BONUS,
              description: "Crédit de bienvenue",
            },
          });

          return {
            id: created.id,
            name: created.name,
            email: created.email,
            image: created.image,
          };
        } catch (error) {
          if (isNextInternalSignal(error)) {
            throw error;
          }
          console.error("authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 24 * 60 * 60 },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export async function auth(): Promise<Session | null> {
  try {
    return await rawAuth();
  } catch (error) {
    if (isNextInternalSignal(error)) {
      throw error;
    }
    console.error("auth() failed:", error);
    return null;
  }
}

export { handlers, signIn, signOut };
