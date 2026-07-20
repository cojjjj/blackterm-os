import { supabase } from "./supabase";

export interface PresenceRecord {
  observer_id: string;
  observer_code: string;
  current_app: string;
  region: string;
  status: string;
  last_seen: string;
}

export interface Transmission {
  id: string;
  title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  origin: string;
  progress: number;
  created_at: string;
}

export interface NetworkOverview {
  active_observers: number;
  total_observers: number;
  total_visits: number;
  open_transmissions: number;
}

const fallbackOverview: NetworkOverview = {
  active_observers: 0,
  total_observers: 0,
  total_visits: 0,
  open_transmissions: 0,
};

function describeSupabaseError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);

  const value = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  return [value.message, value.details, value.hint, value.code]
    .filter(Boolean)
    .join(" | ");
}

export const networkOperationsService = {
  async heartbeat(
    observerId: string,
    observerCode: string,
    currentApp = "desktop",
  ): Promise<void> {
    const { error } = await supabase.rpc("upsert_observer_presence", {
      target_observer_id: observerId,
      target_observer_code: observerCode,
      target_current_app: currentApp,
    });

    if (error) {
      throw new Error(`Presence heartbeat failed: ${describeSupabaseError(error)}`);
    }
  },

  async setOffline(observerId: string): Promise<void> {
    const { error } = await supabase.rpc("set_observer_offline", {
      target_observer_id: observerId,
    });

    if (error) {
      console.error("Unable to mark observer offline:", error);
    }
  },

  async listPresence(): Promise<PresenceRecord[]> {
    const { data, error } = await supabase
      .from("observer_presence")
      .select(
        "observer_id, observer_code, current_app, region, status, last_seen",
      )
      .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .eq("status", "ONLINE")
      .order("last_seen", { ascending: false })
      .limit(24);

    if (error) {
      throw new Error(`Presence query failed: ${describeSupabaseError(error)}`);
    }

    return (data ?? []) as PresenceRecord[];
  },

  async listTransmissions(): Promise<Transmission[]> {
    const { data, error } = await supabase
      .from("network_transmissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      throw new Error(`Transmission query failed: ${describeSupabaseError(error)}`);
    }

    return (data ?? []) as Transmission[];
  },

  async getOverview(): Promise<NetworkOverview> {
    const { data, error } = await supabase.rpc(
      "get_network_operations_overview",
    );

    if (error) {
      throw new Error(`Overview query failed: ${describeSupabaseError(error)}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
      active_observers: Number(row?.active_observers ?? 0),
      total_observers: Number(row?.total_observers ?? 0),
      total_visits: Number(row?.total_visits ?? 0),
      open_transmissions: Number(row?.open_transmissions ?? 0),
    };
  },

  subscribePresence(onChange: () => void) {
    const channel = supabase
      .channel("blackterm-presence-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "observer_presence",
        },
        onChange,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },

  subscribeTransmissions(onTransmission: (item: Transmission) => void) {
    const channel = supabase
      .channel("blackterm-transmissions-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "network_transmissions",
        },
        (payload) => onTransmission(payload.new as Transmission),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
