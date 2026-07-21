import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "merchant";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async (u: User | null) => {
      if (!alive) return;
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id);
      const roles = (data ?? []).map((r) => r.role as AppRole);
      setRole(roles.includes("admin") ? "admin" : roles[0] ?? "merchant");
      setLoading(false);
    };
    supabase.auth.getUser().then(({ data }) => load(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load(session?.user ?? null);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}
