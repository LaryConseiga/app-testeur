import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";

import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FlaskConical className="size-6" />
          </span>
          <CardTitle className="text-xl">Connexion à TestSwapper</CardTitle>
          <CardDescription>
            Entrez votre nom et votre email pour continuer. Aucun mot de passe
            requis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            En continuant, vous recevez un crédit de bienvenue de 3 crédits
            pour publier votre première app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
