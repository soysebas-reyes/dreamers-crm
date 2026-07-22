import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isDemoMode } from "@/lib/demo";
import { devLogin, magicLinkSignIn } from "@/server/actions/auth";

export default function LoginPage() {
  const hasResend = !!process.env.AUTH_RESEND_KEY;
  const isDev = process.env.NODE_ENV === "development";
  const isDemo = isDemoMode();
  const showCredentials = isDev || isDemo;
  const hasAnyProvider = hasResend || showCredentials;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Image
            src="/helpbnk-logo.png"
            alt="HelpBnk"
            width={724}
            height={172}
            className="mb-2 h-7 w-auto"
          />
          <CardTitle>Dreamers CRM</CardTitle>
          <CardDescription>
            Nobody who asked for help gets forgotten here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {hasResend && (
            <form action={magicLinkSignIn} className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@helpbnk.org"
                required
                autoComplete="email"
              />
              <Button type="submit" className="mt-1">
                Send magic link
              </Button>
            </form>
          )}
          {hasResend && showCredentials && <Separator />}
          {showCredentials && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                {isDemo
                  ? "This is a live demo — every person, dream, and conversation in it is fictional. Pick a profile to see how Dreamers CRM looks for a HelpBnk helper:"
                  : "Development mode — sign in as a seeded demo helper:"}
              </p>
              <form action={devLogin.bind(null, "lead@dev.local")}>
                <Button type="submit" variant="secondary" className="w-full">
                  {isDemo
                    ? "Explore the demo as Sam (Lead)"
                    : "Continue as Sam (Lead)"}
                </Button>
              </form>
              <form action={devLogin.bind(null, "helper@dev.local")}>
                <Button type="submit" variant="secondary" className="w-full">
                  {isDemo
                    ? "Explore the demo as Priya (Helper)"
                    : "Continue as Priya (Helper)"}
                </Button>
              </form>
            </div>
          )}
          {!hasAnyProvider && (
            <p className="text-muted-foreground text-sm">
              No sign-in method is configured for this environment. Set{" "}
              <code className="font-mono">AUTH_RESEND_KEY</code> in your
              deployment&apos;s environment variables to enable magic-link
              sign-in.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">
            A CRM for tracking people you&apos;re helping, not selling to.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
