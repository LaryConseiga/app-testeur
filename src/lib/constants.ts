import { Platform } from "@/generated/prisma/enums";

export const PLATFORM_LABELS: Record<Platform, string> = {
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
};

export const FEEDBACK_TAGS = [
  "UX",
  "Bugs",
  "Onboarding",
  "Performance",
  "Design",
] as const;

export type FeedbackTag = (typeof FEEDBACK_TAGS)[number];

export const RATING_QUESTIONS = [
  {
    key: "onboardingClarity",
    label: "Clarté de l'onboarding",
    description: "L'accueil et la prise en main étaient-ils clairs ?",
  },
  {
    key: "navigationEase",
    label: "Facilité de navigation",
    description: "Était-il facile de se repérer dans l'application ?",
  },
  {
    key: "stabilityBugs",
    label: "Stabilité",
    description: "L'application était-elle stable, sans bugs bloquants ?",
  },
  {
    key: "perceivedDesign",
    label: "Design perçu",
    description: "Le design vous a-t-il semblé fonctionnel et soigné ?",
  },
] as const;
