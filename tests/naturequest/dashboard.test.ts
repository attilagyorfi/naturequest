import assert from "node:assert/strict";
import test from "node:test";
import { selectRecommendedQuest } from "../../src/lib/dashboard";

const quests = [
  { id: "q1", slug: "erdei-nyomkereso", title: "Erdei nyomkereső" },
  { id: "q2", slug: "varosi-tortenelmi-seta", title: "Városi történelmi séta" },
  { id: "q3", slug: "mese-es-helyszin", title: "Mese és helyszín" },
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
