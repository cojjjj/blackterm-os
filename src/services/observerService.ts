import type { Observer } from "../types/backend";
import { authService } from "./authService";
import { supabase } from "./supabase";

function makeObserverCode(): string {
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `OBS-${random}`;
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return String(error);
  const value = error as { message?: string; details?: string; hint?: string; code?: string };
  return [value.message, value.details, value.hint, value.code].filter(Boolean).join(" | ");
}

export const observerService = {
  async getOrCreate(): Promise<Observer> {
    await authService.ensureAnonymousSession();

    const { data, error } = await supabase.rpc("bootstrap_observer", {
      requested_observer_code: makeObserverCode(),
    });

    if (error) {
      throw new Error(`Observer bootstrap failed: ${describeError(error)}`);
    }

    const observer = Array.isArray(data) ? data[0] : data;
    if (!observer) throw new Error("Observer bootstrap returned no profile.");
    return observer as Observer;
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

    if (error) throw new Error(`Observer update failed: ${describeError(error)}`);
    return data as Observer;
  },

  async addSessionTime(observerId: string, seconds: number): Promise<void> {
    if (!Number.isFinite(seconds) || seconds <= 0) return;

    const { error } = await supabase.rpc("increment_observer_time", {
      target_observer_id: observerId,
      seconds_to_add: Math.floor(seconds),
    });

    if (error) {
      throw new Error(`Session sync failed: ${describeError(error)}`);
    }
  },
};
