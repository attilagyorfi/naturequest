import Link from "next/link";

type Badge = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  message: string;
  totalPoints: number | null;
  previousLevel: number | null;
  level: number | null;
  leveledUp: boolean;
  xpUntilNextLevel: number | null;
  pointsReward: number | null;
  badges: Badge[];
  nextQuestHref?: string;
};

export default function RewardPanel({
  message,
  totalPoints,
  previousLevel,
  level,
  leveledUp,
  xpUntilNextLevel,
  pointsReward,
  badges,
  nextQuestHref = "/quests",
}: Props) {
  return (
    <div className="rounded-lg border border-[#d9c8a4] bg-[#fffaf0] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
        Jutalom feloldva
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#193226]">{message}</h2>

      {leveledUp && level !== null ? (
        <p className="mt-3 rounded-lg border border-[#b99555] bg-white px-4 py-3 text-sm font-semibold text-[#7b5f2e]">
          Szintlépés: {previousLevel ?? level - 1}. szintről {level}. szintre!
        </p>
      ) : xpUntilNextLevel !== null ? (
        <p className="mt-3 rounded-lg border border-[#d9c8a4] bg-white px-4 py-3 text-sm text-[#52645c]">
          Még {xpUntilNextLevel} XP kell a következő szintig.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {pointsReward !== null ? (
          <div className="rounded-lg bg-white px-4 py-3">
            <p className="text-xs uppercase text-[#52645c]">Most szerzett XP</p>
            <p className="mt-1 text-xl font-bold">+{pointsReward}</p>
          </div>
        ) : null}
        {totalPoints !== null ? (
          <div className="rounded-lg bg-white px-4 py-3">
            <p className="text-xs uppercase text-[#52645c]">Összes XP</p>
            <p className="mt-1 text-xl font-bold">{totalPoints}</p>
          </div>
        ) : null}
        {level !== null ? (
          <div className="rounded-lg bg-white px-4 py-3">
            <p className="text-xs uppercase text-[#52645c]">Szint</p>
            <p className="mt-1 text-xl font-bold">{level}</p>
          </div>
        ) : null}
      </div>

      {badges.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {badges.map((badge) => (
            <li
              key={badge.id}
              className="rounded-lg border border-[#d9c8a4] bg-white p-3"
            >
              <strong>{badge.name}</strong> - {badge.description}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
        >
          Vissza a hőstáblára
        </Link>
        <Link
          href={nextQuestHref}
          className="rounded-lg border border-[#1b4332] px-5 py-3 font-semibold text-[#1b4332]"
        >
          Következő küldetés
        </Link>
      </div>
    </div>
  );
}
