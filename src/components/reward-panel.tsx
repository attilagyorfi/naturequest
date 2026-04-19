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
};

export default function RewardPanel({
  message,
  totalPoints,
  level,
  badges,
}: Props) {
  return (
    <div className="rounded-lg border border-[#d9c8a4] bg-[#fffaf0] p-5">
      <p className="font-semibold text-[#193226]">{message}</p>
      {totalPoints !== null ? (
        <p className="mt-2 text-sm">Összes XP: {totalPoints}</p>
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
    </div>
  );
}
