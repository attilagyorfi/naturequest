import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAchievementEntry,
  type AchievementEntry,
} from "../../src/lib/chronicle";

function makeEntry(overrides: Partial<AchievementEntry> = {}): AchievementEntry {
  return {
    action: "QUEST_COMPLETED",
    pointsDelta: 20,
    note: "Teljesített küldetés: Erdei nyomkereső",
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    ...overrides,
  };
}

test("formatAchievementEntry creates a quest-completed chronicle card", () => {
  const entry = formatAchievementEntry(makeEntry());

  assert.equal(entry.title, "Teljesítetted: Erdei nyomkereső");
  assert.equal(entry.detail, "Új tapasztalat került a krónikádba.");
  assert.equal(entry.pointsLabel, "+20 XP");
});

test("formatAchievementEntry falls back to note when it cannot extract a quest title", () => {
  const entry = formatAchievementEntry(
    makeEntry({ note: "Saját megjegyzés a kalandról" })
  );

  assert.equal(entry.title, "Saját megjegyzés a kalandról");
  assert.equal(entry.pointsLabel, "+20 XP");
});

test("formatAchievementEntry formats seed and generic entries safely", () => {
  const seeded = formatAchievementEntry(
    makeEntry({
      action: "SEED_DATABASE",
      pointsDelta: 0,
      note: "Kezdeti rendszerfeltöltés kategóriákkal.",
    })
  );
  const generic = formatAchievementEntry(
    makeEntry({
      action: "UNKNOWN_EVENT",
      pointsDelta: 5,
      note: null,
    })
  );

  assert.equal(seeded.title, "A krónika világa felébredt");
  assert.equal(seeded.detail, "Kezdeti rendszerfeltöltés kategóriákkal.");
  assert.equal(seeded.pointsLabel, null);

  assert.equal(generic.title, "Új bejegyzés került a krónikába");
  assert.equal(generic.detail, "Minden kaland hagy maga után nyomot.");
  assert.equal(generic.pointsLabel, "+5 XP");
});
