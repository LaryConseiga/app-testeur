"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagInput } from "@/components/tag-input";
import { createApp } from "@/lib/actions/app-actions";
import { publishAppSchema, type PublishAppInput } from "@/lib/validation";
import { FEEDBACK_TAGS, PLATFORM_LABELS } from "@/lib/constants";

export function PublishAppForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PublishAppInput>({
    resolver: zodResolver(publishAppSchema),
    defaultValues: {
      name: "",
      description: "",
      accessUrl: "",
      platform: "WEB",
      techStack: [],
      feedbackFocus: "",
      feedbackTags: [],
    },
  });

  async function onSubmit(values: PublishAppInput) {
    setIsSubmitting(true);
    try {
      const result = await createApp(values);
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l&apos;app</FormLabel>
              <FormControl>
                <Input placeholder="Ex : StudyBuddy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description courte</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="En quelques phrases, qu'est-ce que fait votre app ?"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="accessUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lien d&apos;accès</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://... (web, TestFlight, APK...)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plateforme</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="techStack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stack technique</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Ex : React Native, Flutter, Django..."
                />
              </FormControl>
              <FormDescription>
                Appuyez sur Entrée pour ajouter un tag.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedbackFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sur quoi voulez-vous du feedback en priorité ?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex : Le flow d'inscription est-il clair ?"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedbackTags"
          render={() => (
            <FormItem>
              <FormLabel>Catégories concernées</FormLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEEDBACK_TAGS.map((tag) => (
                  <FormField
                    key={tag}
                    control={form.control}
                    name="feedbackTags"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(tag)}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                checked
                                  ? [...(field.value ?? []), tag]
                                  : field.value?.filter((v) => v !== tag)
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{tag}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Publier (1 crédit)
          </Button>
        </div>
      </form>
    </Form>
  );
}
