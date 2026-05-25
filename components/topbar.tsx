import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { clearSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

async function logout() {
  "use server";
  clearSession();
  redirect("/");
}

export function Topbar({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-orange-500 text-white">P</span>
          PrepPilot
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <Button asChild size="sm">
            <Link href="/papers/new">
              <Plus className="h-4 w-4" />
              New Paper
            </Link>
          </Button>
          <form action={logout}>
            <Button variant="outline" size="icon" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
