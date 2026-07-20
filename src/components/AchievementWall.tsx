import { useMemo, useState } from "react";
import {
  achievementRecords,
  achievementSummary,
  type AchievementCategory,
  type AchievementRecord,
} from "../data/achievements";

type AchievementFilter =
  | "All"
  | "Unlocked"
  | "Locked"
  | AchievementCategory;

const FILTERS: AchievementFilter[] = [
  "All",
  "Unlocked",
  "Locked",
  "Career",
  "Cybersecurity",
  "Builder",
  "Training",
  "Platform",
];

const RARITY_SCORE = {
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
} as const;

function matchesFilter(
  achievement: AchievementRecord,
  filter: AchievementFilter,
): boolean {
  if (filter === "All") return true;
  if (filter === "Unlocked") return achievement.status === "UNLOCKED";
  if (filter === "Locked") return achievement.status === "LOCKED";
  return achievement.category === filter;
}

export default function AchievementWall() {
  const [filter, setFilter] = useState<AchievementFilter>("All");
  const [selected, setSelected] = useState<AchievementRecord | null>(null);

  const visibleAchievements = useMemo(
    () =>
      achievementRecords
        .filter((achievement) => matchesFilter(achievement, filter))
        .sort(
          (a, b) =>
            Number(b.status === "UNLOCKED") -
              Number(a.status === "UNLOCKED") ||
            RARITY_SCORE[b.rarity] - RARITY_SCORE[a.rarity],
        ),
    [filter],
  );

  return (
    <div className="achievement-wall">
      <header className="achievement-wall-hero">
        <div className="achievement-wall-emblem">
          <span>AW</span>
          <i />
        </div>

        <div>
          <small>BLACKTERM // OPERATOR MILESTONES</small>
          <h1>Achievement Wall</h1>
          <p>
            Career progress, cybersecurity training, technical projects,
            platform milestones, and future objectives.
          </p>
        </div>

        <div className="achievement-wall-rank">
          <small>OPERATOR COMPLETION</small>
          <strong>{achievementSummary.completion}%</strong>
          <div>
            <i style={{ width: `${achievementSummary.completion}%` }} />
          </div>
        </div>
      </header>

      <section className="achievement-wall-stats">
        <article>
          <small>TOTAL RECORDS</small>
          <strong>{achievementSummary.total}</strong>
        </article>
        <article>
          <small>UNLOCKED</small>
          <strong>{achievementSummary.unlocked}</strong>
        </article>
        <article>
          <small>LOCKED</small>
          <strong>{achievementSummary.locked}</strong>
        </article>
        <article>
          <small>LEGENDARY</small>
          <strong>
            {
              achievementRecords.filter(
                (achievement) =>
                  achievement.rarity === "LEGENDARY" &&
                  achievement.status === "UNLOCKED",
              ).length
            }
          </strong>
        </article>
      </section>

      <div className="achievement-wall-toolbar">
        <div>
          <small>FILTER MILESTONES</small>
          <span>
            {visibleAchievements.length} RECORDS DISPLAYED
          </span>
        </div>

        <nav>
          {FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <section className="achievement-grid">
        {visibleAchievements.map((achievement) => (
          <article
            key={achievement.id}
            className={[
              "achievement-card",
              achievement.status.toLowerCase(),
              `rarity-${achievement.rarity.toLowerCase()}`,
            ].join(" ")}
          >
            <header>
              <div className="achievement-icon">
                <span>{achievement.icon}</span>
                <i />
              </div>

              <div>
                <small>{achievement.category}</small>
                <h2>{achievement.title}</h2>
              </div>

              <b>{achievement.status}</b>
            </header>

            <p>{achievement.description}</p>

            <div className="achievement-progress">
              <div>
                <span>PROGRESS</span>
                <strong>{achievement.progress}%</strong>
              </div>
              <div>
                <i style={{ width: `${achievement.progress}%` }} />
              </div>
            </div>

            <footer>
              <span>{achievement.rarity}</span>
              <button onClick={() => setSelected(achievement)}>
                INSPECT MILESTONE
              </button>
            </footer>
          </article>
        ))}
      </section>

      {selected ? (
        <div
          className="achievement-modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelected(null)}
        >
          <section
            className={`achievement-modal rarity-${selected.rarity.toLowerCase()}`}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div className="achievement-modal-icon">
                {selected.icon}
              </div>

              <div>
                <small>BLACKTERM ACHIEVEMENT RECORD</small>
                <h2>{selected.title}</h2>
                <p>
                  {selected.category} // {selected.rarity}
                </p>
              </div>

              <button
                aria-label="Close achievement"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </header>

            <div className="achievement-modal-status">
              <span>● {selected.status}</span>
              <strong>{selected.progress}% COMPLETE</strong>
            </div>

            <article>
              <small>MILESTONE DESCRIPTION</small>
              <p>{selected.description}</p>
            </article>

            <dl>
              <div>
                <dt>STATUS</dt>
                <dd>{selected.status}</dd>
              </div>
              <div>
                <dt>RARITY</dt>
                <dd>{selected.rarity}</dd>
              </div>
              <div>
                <dt>UNLOCK SOURCE</dt>
                <dd>
                  {selected.unlockedAt ??
                    selected.target ??
                    "Objective pending"}
                </dd>
              </div>
            </dl>

            <div className="achievement-modal-progress">
              <i style={{ width: `${selected.progress}%` }} />
            </div>

            <footer>
              <span>
                {selected.status === "UNLOCKED"
                  ? "ACHIEVEMENT VERIFIED"
                  : `NEXT TARGET: ${selected.target ?? "IN PROGRESS"}`}
              </span>
              <button onClick={() => setSelected(null)}>
                CLOSE RECORD
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
