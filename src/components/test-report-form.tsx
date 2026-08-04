"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { RatingScale } from "@/components/rating-scale";
import { submitTestReport } from "@/lib/actions/report-actions";
import { testReportSchema, type TestReportInput } from "@/lib/validation";
import { RATING_QUESTIONS } from "@/lib/constants";

export function TestReportForm({ appId }: { appId: string }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<TestReportInput>({
    resolver: zodResolver(testReportSchema),
    defaultValues: {
      appId,
      onboardingClarity: 3,
      navigationEase: 3,
      stabilityBugs: 3,
      perceivedDesign: 3,
      strengths: "",
      improvements: "",
      timeSpentMinutes: 15,
      bugs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bugs",
  });

  async function onSubmit(values: TestReportInput) {
    setIsSubmitting(true);
    try {
      const result = await submitTestReport(values);
      if (result?.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-5">
          {RATING_QUESTIONS.map((question) => (
            <FormField
              key={question.key}
              control={form.control}
              name={question.key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{question.label}</FormLabel>
                  <FormDescription>{question.description}</FormDescription>
                  <FormControl>
                    <RatingScale value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="strengths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points forts</FormLabel>
                <FormControl>
                  <Textarea rows={3} maxLength={300} {...field} />
                </FormControl>
                <FormDescription>
                  {field.value.length}/300
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="improvements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points à améliorer</FormLabel>
                <FormControl>
                  <Textarea rows={3} maxLength={300} {...field} />
                </FormControl>
                <FormDescription>
                  {field.value.length}/300
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Bugs rencontrés (optionnel)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", description: "" })}
              disabled={fields.length >= 10}
            >
              <Plus />
              Ajouter un bug
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="grid gap-3 pt-6 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
                <FormField
                  control={form.control}
                  name={`bugs.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sm:sr-only">Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du bug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`bugs.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sm:sr-only">Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Description courte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Retirer ce bug"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <FormField
          control={form.control}
          name="timeSpentMinutes"
          render={({ field }) => (
            <FormItem className="max-w-40">
              <FormLabel>Temps passé (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Soumettre le rapport (+1 crédit)
          </Button>
        </div>
      </form>
    </Form>
  );
}
