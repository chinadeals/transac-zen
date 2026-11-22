import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PayFlow Gateway" },
      { name: "description", content: "PayFlow Gateway admin dashboard." },
      { property: "og:title", content: "PayFlow workspace" },
      { property: "og:description", content: "Manage business documents and follow payment activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const section = pathname === "/dashboard" || pathname === "/dashboard/"
    ? "Overview"
    : pathname.split("/").filter(Boolean).at(-1)?.replace(/-/g, " ") ?? "Workspace";
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
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Workspace</span>
              <span aria-hidden="true" className="text-border">/</span>
              <span className="font-medium capitalize">{section}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/portal">Client view</Link>
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1440px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
