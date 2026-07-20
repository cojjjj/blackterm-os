import type { ObserverSession } from "../types/backend";
import { achievementService } from "../services/achievementService";
import { observerService } from "../services/observerService";

export type BootStage =
  | "CONNECTING"
  | "AUTHENTICATING"
  | "LOADING_OBSERVER"
  | "SYNCING_ACHIEVEMENTS"
  | "READY";

export interface BootProgress {
  stage: BootStage;
  message: string;
}

export async function bootObserverNetwork(
  onProgress?: (progress: BootProgress) => void,
): Promise<ObserverSession> {
  onProgress?.({ stage: "CONNECTING", message: "Connecting to Observer Network..." });
  onProgress?.({ stage: "AUTHENTICATING", message: "Establishing anonymous identity..." });
  onProgress?.({ stage: "LOADING_OBSERVER", message: "Loading observer profile..." });

  const observer = await observerService.getOrCreate();

  onProgress?.({
    stage: "SYNCING_ACHIEVEMENTS",
    message: "Synchronizing achievements...",
  });

  await achievementService.unlock(observer.id, "FIRST_CONNECTION");
  const achievements = await achievementService.listForObserver(observer.id);
  const points = achievementService.calculatePoints(achievements);

  onProgress?.({ stage: "READY", message: "Observer Network synchronized." });

  return { observer, achievements, points };
}
