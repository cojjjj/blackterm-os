import { supabase } from "./supabase";

export interface CommandBriefing {
  threat_level: string;
  active_observers: number;
  transmission_count: number;
  achievement_count: number;
  total_points: number;
  mission_status: string;
}

const fallback: CommandBriefing = {
  threat_level: "LOW",
  active_observers: 0,
  transmission_count: 0,
  achievement_count: 0,
  total_points: 0,
  mission_status: "UNASSIGNED",
};

export const briefingService = {
  async get(observerId: string): Promise<CommandBriefing> {
    const { data, error } = await supabase.rpc("get_command_briefing", {
      target_observer_id: observerId,
    });

    if (error) {
      console.error("Unable to load command briefing:", error);
      return fallback;
    }

    const row = Array.isArray(data) ? data[0] : data;

    return {
      threat_level: String(row?.threat_level ?? "LOW"),
      active_observers: Number(row?.active_observers ?? 0),
      transmission_count: Number(row?.transmission_count ?? 0),
      achievement_count: Number(row?.achievement_count ?? 0),
      total_points: Number(row?.total_points ?? 0),
      mission_status: String(row?.mission_status ?? "UNASSIGNED"),
    };
  },
};
