type QuestCategoryLike = {
  slug: string;
  name: string;
};

type QuestLike = {
  id: string;
  pointsReward: number;
  estimatedMinutes: number | null;
  category: QuestCategoryLike;
};

type QuestProgressLike = {
  questId: string;
  quest: {
    category: QuestCategoryLike;
  };
};

export function selectRecommendedQuest<TQuest extends QuestLike>(
  quests: TQuest[],
  completedQuestIds: Set<string>,
  completedProgress: QuestProgressLike[] = []
) {
  const incompleteQuests = quests.filter(
    (quest) => !completedQuestIds.has(quest.id)
  );

  if (incompleteQuests.length === 0) {
    return null;
  }

  const completedCategoryCounts = new Map<string, number>();

  for (const item of completedProgress) {
    const currentCount =
      completedCategoryCounts.get(item.quest.category.slug) ?? 0;
    completedCategoryCounts.set(item.quest.category.slug, currentCount + 1);
  }

  return incompleteQuests.reduce((bestQuest, currentQuest) => {
    if (!bestQuest) {
      return currentQuest;
    }

    const bestCategoryCount =
      completedCategoryCounts.get(bestQuest.category.slug) ?? 0;
    const currentCategoryCount =
      completedCategoryCounts.get(currentQuest.category.slug) ?? 0;

    if (currentCategoryCount !== bestCategoryCount) {
      return currentCategoryCount < bestCategoryCount ? currentQuest : bestQuest;
    }

    if (currentQuest.pointsReward !== bestQuest.pointsReward) {
      return currentQuest.pointsReward > bestQuest.pointsReward
        ? currentQuest
        : bestQuest;
    }

    const bestDuration = bestQuest.estimatedMinutes ?? Number.MAX_SAFE_INTEGER;
    const currentDuration =
      currentQuest.estimatedMinutes ?? Number.MAX_SAFE_INTEGER;

    if (currentDuration !== bestDuration) {
      return currentDuration < bestDuration ? currentQuest : bestQuest;
    }

    return bestQuest;
  }, incompleteQuests[0] ?? null);
}

export function describeRecommendedQuestReason<TQuest extends QuestLike>(
  quest: TQuest | null,
  completedProgress: QuestProgressLike[] = []
) {
  if (!quest) {
    return "A Kronikasok keszitik a kovetkezo kalandot.";
  }

  const hasCompletedSameCategory = completedProgress.some(
    (item) => item.quest.category.slug === quest.category.slug
  );

  if (!hasCompletedSameCategory) {
    return "Uj temakorbe vezet, igy valtozatosabban haladhatsz tovabb.";
  }

  if (quest.pointsReward >= 25) {
    return "Ersebb jutalommal gyorsabban kozelitheted meg a kovetkezo szintet.";
  }

  return "Jo kovetkezo lepes a mostani elorehaladasodhoz es idokeretedhez.";
}
