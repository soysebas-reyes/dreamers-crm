import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A server action that ends in redirect() throws a special digest-tagged
// error to signal Next.js's router — a plain try/catch around a directly
// awaited action call (as opposed to a native <form action> submission)
// intercepts it before Next.js can, showing a spurious "NEXT_REDIRECT"
// error toast even though the action succeeded. Rethrow it unchanged so
// the redirect still completes.
export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
