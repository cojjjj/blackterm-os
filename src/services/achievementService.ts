import type { Achievement, ObserverAchievement } from "../types/backend";
import { supabase } from "./supabase";

export const achievementService = {
  async listForObserver(observerId: string): Promise<ObserverAchievement[]> {
    const { data, error } = await supabase
      .from("observer_achievements")
      .select(`
        id,
        observer_id,
        achievement_id,
        unlocked_at,
        achievement:achievements (
          id,
          code,
          name,
          description,
          points
        )
      `)
      .eq("observer_id", observerId)
      .order("unlocked_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ObserverAchievement[];
  },

  async unlock(
    observerId: string,
    achievementCode: string,
  ): Promise<{ unlocked: boolean; achievement: Achievement }> {
    const { data: achievement, error: achievementError } = await supabase
      .from("achievements")
      .select("*")
      .eq("code", achievementCode)
      .single();

    if (achievementError) throw achievementError;

    const { data: existing, error: existingError } = await supabase
      .from("observer_achievements")
      .select("id")
      .eq("observer_id", observerId)
      .eq("achievement_id", achievement.id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return { unlocked: false, achievement: achievement as Achievement };
    }

    const { error: insertError } = await supabase
      .from("observer_achievements")
      .insert({
        observer_id: observerId,
        achievement_id: achievement.id,
      });

    if (insertError) throw insertError;
    return { unlocked: true, achievement: achievement as Achievement };
  },

  calculatePoints(entries: ObserverAchievement[]): number {
    return entries.reduce(
      (total, entry) => total + (entry.achievement?.points ?? 0),
      0,
    );
  },
};
