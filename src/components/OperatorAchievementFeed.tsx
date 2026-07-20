import { useEffect, useMemo, useState } from "react";

type OperatorFeedProps = {
  activeApp?: string;
  openAchievementWall: () => void;
};

type FeedRecord = {
  eyebrow: string;
  title: string;
  detail: string;
  accent: "gold" | "cyan" | "green" | "violet";
};

const ROTATING_RECORDS: FeedRecord[] = [
  {
    eyebrow: "LEGENDARY MILESTONE",
    title: "Top 1% TryHackMe",
    detail: "1,000+ completed rooms",
    accent: "gold",
  },
  {
    eyebrow: "VERIFIED TRAINING",
    title: "19 Credential Records",
    detail: "15 active • 4 lifetime",
    accent: "cyan",
  },
  {
    eyebrow: "CAREER MILESTONE",
    title: "Desktop Support Technician",
    detail: "Professional IT support role",
    accent: "green",
  },
  {
    eyebrow: "BUILDER MILESTONE",
    title: "Creator of BLACKTERM OS",
    detail: "8,000+ lines and growing",
    accent: "violet",
  },
  {
    eyebrow: "PLATFORM STATUS",
    title: "Live AI Intelligence",
    detail: "Portfolio-grounded assistant online",
    accent: "cyan",
  },
];

const APP_SUGGESTIONS: Record<string, FeedRecord> = {
  certs: {
    eyebrow: "AI SUGGESTION",
    title: "Compare the Achievement Wall",
    detail: "View the milestones behind these credentials",
    accent: "gold",
  },
  resume: {
    eyebrow: "AI SUGGESTION",
    title: "Inspect Career Milestones",
    detail: "Connect experience to verified achievements",
    accent: "green",
  },
  github: {
    eyebrow: "AI SUGGESTION",
    title: "Review Builder Achievements",
    detail: "See the milestones behind the source code",
    accent: "violet",
  },
  projects: {
    eyebrow: "AI SUGGESTION",
    title: "Open Operator Milestones",
    detail: "View the strongest accomplishments at a glance",
    accent: "gold",
  },
  tryhackme: {
    eyebrow: "AI SUGGESTION",
    title: "Top 1% Achievement",
    detail: "Inspect the full TryHackMe milestone record",
    accent: "gold",
  },
};

export default function OperatorAchievementFeed({
  activeApp,
  openAchievementWall,
}: OperatorFeedProps) {
  const [index, setIndex] = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);

  const activeSuggestion = useMemo(
    () => (activeApp ? APP_SUGGESTIONS[activeApp] : undefined),
    [activeApp],
  );

  const current = activeSuggestion ?? ROTATING_RECORDS[index];

  useEffect(() => {
    if (activeSuggestion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % ROTATING_RECORDS.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [activeSuggestion]);

  useEffect(() => {
    const sessionKey = "bt-achievement-intro-shown";

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const showTimer = window.setTimeout(() => {
      setShowUnlock(true);
      sessionStorage.setItem(sessionKey, "true");
    }, 1400);

    const hideTimer = window.setTimeout(() => {
      setShowUnlock(false);
    }, 6500);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={`operator-achievement-feed accent-${current.accent}`}
        onClick={openAchievementWall}
        aria-label="Open Achievement Wall"
      >
        <span className="operator-achievement-feed__badge">AW</span>

        <span className="operator-achievement-feed__copy">
          <small>{current.eyebrow}</small>
          <strong>{current.title}</strong>
          <span>{current.detail}</span>
        </span>

        <span className="operator-achievement-feed__status">
          83% COMPLETE
          <i />
        </span>
      </button>

      {showUnlock ? (
        <button
          type="button"
          className="achievement-unlock-toast"
          onClick={() => {
            setShowUnlock(false);
            openAchievementWall();
          }}
          aria-label="Inspect unlocked achievement"
        >
          <small>SYSTEM EVENT // ACHIEVEMENT UNLOCKED</small>

          <div>
            <span>BT</span>
            <section>
              <strong>CREATOR OF BLACKTERM OS</strong>
              <p>Interactive cybersecurity workstation deployed.</p>
            </section>
          </div>

          <footer>
            <span>LEGENDARY RECORD VERIFIED</span>
            <b>CLICK TO INSPECT →</b>
          </footer>
        </button>
      ) : null}
    </>
  );
}
