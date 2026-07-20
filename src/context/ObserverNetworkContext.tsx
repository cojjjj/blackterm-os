import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { bootObserverNetwork, type BootProgress } from "../engine/boot";
import { networkOperationsService } from "../services/networkOperationsService";
import { observerService } from "../services/observerService";
import type { ObserverSession } from "../types/backend";

interface ObserverNetworkValue {
  session: ObserverSession | null;
  progress: BootProgress;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setCurrentApp: (app: string) => void;
}

const defaultProgress: BootProgress = {
  stage: "CONNECTING",
  message: "Initializing BLACKTERM...",
};

const ObserverNetworkContext =
  createContext<ObserverNetworkValue | undefined>(undefined);

function describeUnknownError(reason: unknown): string {
  if (reason instanceof Error) return reason.message;

  if (reason && typeof reason === "object") {
    const value = reason as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return (
      [value.message, value.details, value.hint, value.code]
        .filter(Boolean)
        .join(" — ") || "Unknown Observer Network error."
    );
  }

  return String(reason || "Unknown Observer Network error.");
}

export function ObserverNetworkProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ObserverSession | null>(null);
  const [progress, setProgress] = useState<BootProgress>(defaultProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionStartedAt = useRef(Date.now());
  const currentApp = useRef("desktop");

  const setCurrentApp = useCallback((app: string) => {
    currentApp.current = app || "desktop";
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSession = await bootObserverNetwork(setProgress);
      setSession(nextSession);
      sessionStartedAt.current = Date.now();

      await networkOperationsService.heartbeat(
        nextSession.observer.id,
        nextSession.observer.observer_id,
        currentApp.current,
      );
    } catch (reason) {
      console.error("BLACKTERM backend boot failed:", reason);
      setError(describeUnknownError(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!session?.observer.id) return;

    const sendHeartbeat = () =>
      networkOperationsService
        .heartbeat(
          session.observer.id,
          session.observer.observer_id,
          currentApp.current,
        )
        .catch((reason) =>
          console.error("BLACKTERM presence heartbeat failed:", reason),
        );

    void sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 30_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void networkOperationsService.setOffline(session.observer.id);
    };
  }, [session?.observer.id, session?.observer.observer_id]);

  useEffect(() => {
    const saveSessionTime = () => {
      if (!session?.observer.id) return;

      const seconds = Math.max(
        1,
        Math.floor((Date.now() - sessionStartedAt.current) / 1000),
      );

      sessionStartedAt.current = Date.now();

      void observerService
        .addSessionTime(session.observer.id, seconds)
        .catch((reason) =>
          console.error("Unable to save BLACKTERM session time:", reason),
        );
    };

    const interval = window.setInterval(saveSessionTime, 60_000);

    return () => {
      window.clearInterval(interval);
      saveSessionTime();
    };
  }, [session?.observer.id]);

  const value = useMemo(
    () => ({
      session,
      progress,
      loading,
      error,
      reload,
      setCurrentApp,
    }),
    [session, progress, loading, error, reload, setCurrentApp],
  );

  return (
    <ObserverNetworkContext.Provider value={value}>
      {children}
    </ObserverNetworkContext.Provider>
  );
}

export function useObserverNetwork(): ObserverNetworkValue {
  const value = useContext(ObserverNetworkContext);

  if (!value) {
    throw new Error(
      "useObserverNetwork must be used inside ObserverNetworkProvider.",
    );
  }

  return value;
}
