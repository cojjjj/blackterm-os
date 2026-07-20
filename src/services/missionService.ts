import { supabase } from "./supabase";

export interface Mission {
  id: string;
  code: string;
  title: string;
  summary: string;
  objective: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ELITE" | string;
  reward_xp: number;
  status: "OPEN" | "ACTIVE" | "COMPLETE" | string;
  origin: string;
  created_at: string;
}

export interface ObserverMission {
  id: string;
  observer_id: string;
  mission_id: string;
  status: "ASSIGNED" | "ACTIVE" | "COMPLETE" | string;
  progress: number;
  assigned_at: string;
  completed_at: string | null;
  mission?: Mission;
}

export const missionService = {
  async getDailyMission(observerId: string): Promise<ObserverMission | null> {
    const { data, error } = await supabase.rpc("assign_daily_mission", {
      target_observer_id: observerId,
    });

    if (error) throw error;
    if (!data) return null;

    const { data: assignment, error: assignmentError } = await supabase
      .from("observer_missions")
      .select(`
        id,
        observer_id,
        mission_id,
        status,
        progress,
        assigned_at,
        completed_at,
        mission:missions (
          id,
          code,
          title,
          summary,
          objective,
          difficulty,
          reward_xp,
          status,
          origin,
          created_at
        )
      `)
      .eq("id", data)
      .single();

    if (assignmentError) throw assignmentError;
    return assignment as unknown as ObserverMission;
  },

  async updateProgress(
    assignmentId: string,
    progress: number,
  ): Promise<ObserverMission> {
    const safeProgress = Math.max(0, Math.min(100, Math.floor(progress)));
    const status = safeProgress >= 100 ? "COMPLETE" : "ACTIVE";

    const { data, error } = await supabase
      .from("observer_missions")
      .update({
        progress: safeProgress,
        status,
        completed_at: safeProgress >= 100 ? new Date().toISOString() : null,
      })
      .eq("id", assignmentId)
      .select("*")
      .single();

    if (error) throw error;
    return data as ObserverMission;
  },
};
