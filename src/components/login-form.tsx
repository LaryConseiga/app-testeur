"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginWithCredentials, requestLoginCode } from "@/lib/actions/auth-actions";
import { requestCodeSchema, type RequestCodeInput } from "@/lib/validation";

const codeOnlySchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});
type CodeOnlyInput = z.infer<typeof codeOnlySchema>;

export function LoginForm() {
  const [step, setStep] = React.useState<"request" | "verify">("request");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [identity, setIdentity] = React.useState<RequestCodeInput | null>(null);

  const requestForm = useForm<RequestCodeInput>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { name: "", email: "" },
  });

  const codeForm = useForm<CodeOnlyInput>({
    resolver: zodResolver(codeOnlySchema),
    defaultValues: { code: "" },
  });

  async function onRequestCode(values: RequestCodeInput) {
    setIsSubmitting(true);
    try {
      const result = await requestLoginCode(values);
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
      setIdentity(values);
      setStep("verify");
      toast.success("Code envoyé ! Vérifiez votre boîte mail.");
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyCode(values: CodeOnlyInput) {
    if (!identity) return;
    setIsSubmitting(true);
    try {
      const result = await loginWithCredentials({ ...identity, code: values.code });
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
      setIsSubmitting(false);
    }
  }

  if (step === "verify" && identity) {
    return (
      <Form {...codeForm}>
        <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
          <button
            type="button"
            onClick={() => setStep("request")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Modifier l&apos;email
          </button>

          <p className="text-sm text-muted-foreground">
            Code envoyé à{" "}
            <span className="font-medium text-foreground">{identity.email}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Vous ne le voyez pas ? Pensez à vérifier vos courriers indésirables
            (spams).
          </p>

          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code de vérification</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    className="text-center text-lg tracking-[0.5em]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Se connecter
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <Form {...requestForm}>
      <form onSubmit={requestForm.handleSubmit(onRequestCode)} className="space-y-4">
        <FormField
          control={requestForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={requestForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Recevoir le code
        </Button>
      </form>
    </Form>
  );
}
