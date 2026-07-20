import type { WorldEvent } from "../types/backend";
import { supabase } from "./supabase";

export const worldEventService = {
  async listLatest(limit = 10): Promise<WorldEvent[]> {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50);

    const { data, error } = await supabase
      .from("world_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    return (data ?? []) as WorldEvent[];
  },

  subscribe(onEvent: (event: WorldEvent) => void) {
    const channel = supabase
      .channel("blackterm-world-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "world_events" },
        (payload) => onEvent(payload.new as WorldEvent),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
