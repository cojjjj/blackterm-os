import type { Observer } from "../types/backend";
import { authService } from "./authService";
import { supabase } from "./supabase";

function makeObserverCode(): string {
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `OBS-${random}`;
}

export const observerService = {
  async getOrCreate(): Promise<Observer> {
    const user = await authService.ensureAnonymousSession();

    const { data: existing, error: selectError } = await supabase
      .from("observers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("observers")
        .update({
          last_seen: new Date().toISOString(),
          total_visits: (existing.total_visits ?? 0) + 1,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) throw updateError;
      return updated as Observer;
    }

    const { data: created, error: insertError } = await supabase
      .from("observers")
      .insert({
        user_id: user.id,
        observer_id: makeObserverCode(),
        username: "Visitor",
        clearance: "VISITOR",
        last_seen: new Date().toISOString(),
        total_visits: 1,
        total_time_seconds: 0,
        unlocked_scene: "midnight-override",
      })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return created as Observer;
  },

  async update(
    observerId: string,
    changes: Partial<
      Pick<
        Observer,
        | "username"
        | "clearance"
        | "last_seen"
        | "total_visits"
        | "total_time_seconds"
        | "unlocked_scene"
      >
    >,
  ): Promise<Observer> {
    const { data, error } = await supabase
      .from("observers")
      .update(changes)
      .eq("id", observerId)
      .select("*")
      .single();

    if (error) throw error;
    return data as Observer;
  },

  async addSessionTime(observerId: string, seconds: number): Promise<void> {
    if (!Number.isFinite(seconds) || seconds <= 0) return;

    const { data: observer, error: readError } = await supabase
      .from("observers")
      .select("total_time_seconds")
      .eq("id", observerId)
      .single();

    if (readError) throw readError;

    const { error: updateError } = await supabase
      .from("observers")
      .update({
        total_time_seconds: (observer.total_time_seconds ?? 0) + Math.floor(seconds),
        last_seen: new Date().toISOString(),
      })
      .eq("id", observerId);

    if (updateError) throw updateError;
  },
};
