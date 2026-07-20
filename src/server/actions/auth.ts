"use server";

import { signIn, signOut } from "@/auth";

export async function devLogin(email: string) {
  await signIn("dev-login", { email, redirectTo: "/today" });
}

export async function magicLinkSignIn(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) return;
  await signIn("resend", { email, redirectTo: "/today" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
