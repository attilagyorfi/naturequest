import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAdventureProgress,
  calculateLevelFromPoints,
  getNextLevelTarget,
  getXpUntilNextLevel,
} from "../../src/lib/progress";

test("calculateAdventureProgress summarizes quest completion", () => {
  assert.deepEqual(
    calculateAdventureProgress({
      totalQuests: 4,
      completedQuests: 1,
      points: 20,
      level: 1,
    }),
    {
      totalQuests: 4,
      completedQuests: 1,
      remainingQuests: 3,
      completionPercent: 25,
      nextLevelTarget: 50,
      xpUntilNextLevel: 30,
    }
  );
});

test("calculateAdventureProgress handles an empty quest catalog", () => {
  assert.deepEqual(
    calculateAdventureProgress({
      totalQuests: 0,
      completedQuests: 0,
      points: 0,
      level: 1,
    }),
    {
      totalQuests: 0,
      completedQuests: 0,
      remainingQuests: 0,
      completionPercent: 0,
      nextLevelTarget: 50,
      xpUntilNextLevel: 50,
    }
  );
});

test("calculateAdventureProgress clamps impossible completed counts", () => {
  const progress = calculateAdventureProgress({
    totalQuests: 3,
    completedQuests: 8,
    points: 160,
    level: 4,
  });

  assert.equal(progress.completedQuests, 3);
  assert.equal(progress.remainingQuests, 0);
  assert.equal(progress.completionPercent, 100);
  assert.equal(progress.xpUntilNextLevel, 40);
});

test("level helpers follow the quest completion level formula", () => {
  assert.equal(calculateLevelFromPoints(0), 1);
  assert.equal(calculateLevelFromPoints(49), 1);
  assert.equal(calculateLevelFromPoints(50), 2);
  assert.equal(calculateLevelFromPoints(99), 2);
  assert.equal(calculateLevelFromPoints(100), 3);
  assert.equal(calculateLevelFromPoints(-10), 1);
  assert.equal(getNextLevelTarget(1), 50);
  assert.equal(getNextLevelTarget(4), 200);
  assert.equal(getXpUntilNextLevel({ points: 49, level: 1 }), 1);
  assert.equal(getXpUntilNextLevel({ points: 50, level: 1 }), 0);
  assert.equal(getXpUntilNextLevel({ points: 120, level: 3 }), 30);
});
