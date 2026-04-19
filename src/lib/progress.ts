const XP_PER_LEVEL = 50;

type ProgressInput = {
  totalQuests: number;
  completedQuests: number;
  points: number;
  level: number;
};

export type AdventureProgress = {
  totalQuests: number;
  completedQuests: number;
  remainingQuests: number;
  completionPercent: number;
  nextLevelTarget: number;
  xpUntilNextLevel: number;
};

export function getNextLevelTarget(level: number) {
  return Math.max(1, level) * XP_PER_LEVEL;
}

export function getXpUntilNextLevel({
  points,
  level,
}: Pick<ProgressInput, "points" | "level">) {
  return Math.max(0, getNextLevelTarget(level) - Math.max(0, points));
}

export function calculateAdventureProgress({
  totalQuests,
  completedQuests,
  points,
  level,
}: ProgressInput): AdventureProgress {
  const safeTotal = Math.max(0, totalQuests);
  const safeCompleted = Math.min(Math.max(0, completedQuests), safeTotal);
  const remainingQuests = Math.max(0, safeTotal - safeCompleted);
  const completionPercent =
    safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);

  return {
    totalQuests: safeTotal,
    completedQuests: safeCompleted,
    remainingQuests,
    completionPercent,
    nextLevelTarget: getNextLevelTarget(level),
    xpUntilNextLevel: getXpUntilNextLevel({ points, level }),
  };
}
