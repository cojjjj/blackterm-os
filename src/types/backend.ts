export type ClearanceLevel =
  | "VISITOR"
  | "OBSERVER"
  | "ANALYST"
  | "OPERATOR"
  | "ADMIN";

export interface Observer {
  id: string;
  user_id: string;
  observer_id: string;
  username: string;
  clearance: ClearanceLevel;
  created_at: string;
  last_seen: string;
  total_visits: number;
  total_time_seconds: number;
  unlocked_scene: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  points: number;
}

export interface ObserverAchievement {
  id: string;
  observer_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  created_at: string;
}

export interface ObserverSession {
  observer: Observer;
  achievements: ObserverAchievement[];
  points: number;
}
