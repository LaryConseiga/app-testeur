import { z } from "zod";
import { Platform } from "@/generated/prisma/enums";
import { FEEDBACK_TAGS } from "@/lib/constants";

export const requestCodeSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(60, "60 caractères maximum"),
  email: z.email("Email invalide"),
});

export type RequestCodeInput = z.infer<typeof requestCodeSchema>;

export const loginSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(60, "60 caractères maximum"),
  email: z.email("Email invalide"),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const publishAppSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(80, "80 caractères maximum"),
  description: z
    .string()
    .min(10, "10 caractères minimum")
    .max(500, "500 caractères maximum"),
  accessUrl: z.url("Doit être une URL valide"),
  platform: z.enum(Platform),
  techStack: z.array(z.string().min(1)).max(10, "10 tags maximum"),
  feedbackFocus: z
    .string()
    .min(5, "5 caractères minimum")
    .max(300, "300 caractères maximum"),
  feedbackTags: z.array(z.enum(FEEDBACK_TAGS)).max(FEEDBACK_TAGS.length),
});

export type PublishAppInput = z.infer<typeof publishAppSchema>;

export const bugEntrySchema = z.object({
  title: z.string().min(2, "2 caractères minimum").max(100, "100 caractères maximum"),
  description: z
    .string()
    .min(5, "5 caractères minimum")
    .max(400, "400 caractères maximum"),
});

export const testReportSchema = z.object({
  appId: z.string().min(1),
  onboardingClarity: z.number().min(1).max(5),
  navigationEase: z.number().min(1).max(5),
  stabilityBugs: z.number().min(1).max(5),
  perceivedDesign: z.number().min(1).max(5),
  strengths: z
    .string()
    .min(5, "5 caractères minimum")
    .max(300, "300 caractères maximum"),
  improvements: z
    .string()
    .min(5, "5 caractères minimum")
    .max(300, "300 caractères maximum"),
  timeSpentMinutes: z
    .number()
    .min(1, "Au moins 1 minute")
    .max(300, "300 minutes maximum"),
  bugs: z.array(bugEntrySchema).max(10, "10 bugs maximum"),
});

export type TestReportInput = z.infer<typeof testReportSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "2 caractères minimum").max(60, "60 caractères maximum"),
  school: z.string().max(120, "120 caractères maximum").optional().or(z.literal("")),
  techStack: z.array(z.string().min(1)).max(15, "15 tags maximum"),
  portfolioUrl: z.url("Doit être une URL valide").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
