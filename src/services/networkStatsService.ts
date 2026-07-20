import { supabase } from "./supabase";

export interface ObserverNetworkStats {
  observer_count: number;
  total_visits: number;
  world_event_count: number;
}

const emptyStats: ObserverNetworkStats = {
  observer_count: 0,
  total_visits: 0,
  world_event_count: 0,
};

export const networkStatsService = {
  async get(): Promise<ObserverNetworkStats> {
    const { data, error } = await supabase.rpc("get_observer_network_stats");

    if (error) {
      console.error("Unable to load Observer Network statistics:", error);
      return emptyStats;
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
      observer_count: Number(row?.observer_count ?? 0),
      total_visits: Number(row?.total_visits ?? 0),
      world_event_count: Number(row?.world_event_count ?? 0),
    };
  },
};
