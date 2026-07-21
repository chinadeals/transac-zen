import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PayFlow Gateway" },
      { name: "description", content: "PayFlow Gateway admin dashboard." },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || cancelled) return;
      await supabase.from("live_sessions").upsert({ user_id: uid, last_seen: new Date().toISOString(), page: pathname });
    };
    ping();
    const t = setInterval(ping, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search clients, invoices, transactions…" className="pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/portal">Client view</Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
