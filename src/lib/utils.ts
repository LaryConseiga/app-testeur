import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Next.js uses thrown errors with a `digest` string (redirect, notFound,
 * dynamic-server-usage bailout, ...) as internal control-flow signals.
 * These must always be rethrown, never swallowed by a try/catch.
 */
export function isNextInternalSignal(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string"
  )
}
