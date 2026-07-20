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
import { devLogin, magicLinkSignIn } from "@/server/actions/auth";

export default function LoginPage() {
  const hasResend = !!process.env.AUTH_RESEND_KEY;
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
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
          {hasResend && isDev && <Separator />}
          {isDev && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                Development mode — sign in as a seeded demo helper:
              </p>
              <form action={devLogin.bind(null, "lead@dev.local")}>
                <Button type="submit" variant="secondary" className="w-full">
                  Continue as Sam (Lead)
                </Button>
              </form>
              <form action={devLogin.bind(null, "helper@dev.local")}>
                <Button type="submit" variant="secondary" className="w-full">
                  Continue as Priya (Helper)
                </Button>
              </form>
            </div>
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
