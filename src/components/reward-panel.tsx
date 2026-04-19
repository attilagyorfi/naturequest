import Link from "next/link";

type Badge = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  message: string;
  totalPoints: number | null;
  level: number | null;
  badges: Badge[];
  nextQuestHref?: string;
};

export default function RewardPanel({
  message,
  totalPoints,
  level,
  badges,
  nextQuestHref = "/quests",
}: Props) {
  return (
    <div className="rounded-lg border border-[#d9c8a4] bg-[#fffaf0] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
        Jutalom feloldva
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#193226]">{message}</h2>
      {totalPoints !== null ? (
        <p className="mt-3 text-sm">Összes XP: {totalPoints}</p>
      ) : null}
      {level !== null ? <p className="mt-1 text-sm">Szint: {level}</p> : null}
      {badges.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
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
