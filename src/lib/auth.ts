import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import { WELCOME_CREDITS } from "@/lib/credits";
import { CreditTransactionType } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: WELCOME_CREDITS,
          type: CreditTransactionType.WELCOME_BONUS,
          description: "Crédit de bienvenue",
        },
      });
    },
  },
});
