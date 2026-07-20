import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/layout/app-nav";
import { UserMenu } from "@/components/layout/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">Dreamers CRM</span>
          <AppNav />
        </div>
        <UserMenu
          name={session.user.name ?? session.user.email ?? "Helper"}
          role={session.user.role}
        />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
