export type AchievementEntry = {
  action: string;
  pointsDelta: number;
  note: string | null;
  createdAt: Date;
};

export type ChronicleCard = {
  title: string;
  detail: string;
  pointsLabel: string | null;
};

function extractQuestTitle(note: string | null) {
  if (!note) {
    return null;
  }

  const match = note.match(/^Teljesített küldetés:\s*(.+)$/);
  return match?.[1] ?? null;
}

export function formatAchievementEntry(
  achievement: AchievementEntry
): ChronicleCard {
  const pointsLabel =
    achievement.pointsDelta > 0 ? `+${achievement.pointsDelta} XP` : null;

  if (achievement.action === "QUEST_COMPLETED") {
    const questTitle = extractQuestTitle(achievement.note);

    return {
      title: questTitle
        ? `Teljesítetted: ${questTitle}`
        : achievement.note ?? "Sikeresen lezártál egy küldetést",
      detail: "Új tapasztalat került a krónikádba.",
      pointsLabel,
    };
  }

  if (achievement.action === "SEED_DATABASE") {
    return {
      title: "A krónika világa felébredt",
      detail: achievement.note ?? "A kaland első fejezete készen áll.",
      pointsLabel: null,
    };
  }

  return {
    title: achievement.note ?? "Új bejegyzés került a krónikába",
    detail: achievement.note ? "A kaland tovább írja önmagát." : "Minden kaland hagy maga után nyomot.",
    pointsLabel,
  };
}
