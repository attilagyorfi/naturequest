type QuestLike = {
  id: string;
};

export function selectRecommendedQuest<TQuest extends QuestLike>(
  quests: TQuest[],
  completedQuestIds: Set<string>
) {
  return quests.find((quest) => !completedQuestIds.has(quest.id)) ?? null;
}
