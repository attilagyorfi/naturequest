import assert from "node:assert/strict";
import test from "node:test";
import {
  describeRecommendedQuestReason,
  selectRecommendedQuest,
} from "../../src/lib/dashboard";

const quests = [
  {
    id: "q1",
    slug: "erdei-nyomkereso",
    title: "Erdei nyomkereso",
    pointsReward: 20,
    estimatedMinutes: 25,
    category: { slug: "termeszet", name: "Termeszet" },
  },
  {
    id: "q2",
    slug: "varosi-tortenelmi-seta",
    title: "Varosi tortenelmi seta",
    pointsReward: 25,
    estimatedMinutes: 30,
    category: { slug: "tortenelem", name: "Tortenelem" },
  },
  {
    id: "q3",
    slug: "mese-es-helyszin",
    title: "Mese es helyszin",
    pointsReward: 15,
    estimatedMinutes: 20,
    category: { slug: "irodalom", name: "Irodalom" },
  },
];

test("selectRecommendedQuest picks the first incomplete quest", () => {
  assert.equal(selectRecommendedQuest(quests, new Set(["q1"]))?.id, "q2");
});

test("selectRecommendedQuest returns null when every quest is complete", () => {
  assert.equal(
    selectRecommendedQuest(quests, new Set(["q1", "q2", "q3"])),
    null
  );
});

test("selectRecommendedQuest handles an empty quest list", () => {
  assert.equal(selectRecommendedQuest([], new Set()), null);
});

test("selectRecommendedQuest prefers an unexplored category", () => {
  const completedProgress = [
    {
      questId: "q1",
      quest: {
        category: { slug: "termeszet", name: "Termeszet" },
      },
    },
  ];

  assert.equal(
    selectRecommendedQuest(quests, new Set(["q1"]), completedProgress)?.id,
    "q2"
  );
});

test("selectRecommendedQuest falls back to higher reward when categories tie", () => {
  const tiedQuests = [
    quests[0],
    {
      id: "q4",
      slug: "mini-piac-kaland",
      title: "Mini piac kaland",
      pointsReward: 30,
      estimatedMinutes: 25,
      category: { slug: "kozgazdasagtan", name: "Kozgazdasagtan" },
    },
  ];

  assert.equal(selectRecommendedQuest(tiedQuests, new Set())?.id, "q4");
});

test("describeRecommendedQuestReason highlights a new category", () => {
  const reason = describeRecommendedQuestReason(quests[1], [
    {
      questId: "q1",
      quest: {
        category: { slug: "termeszet", name: "Termeszet" },
      },
    },
  ]);

  assert.match(reason, /Uj temakor/);
});
