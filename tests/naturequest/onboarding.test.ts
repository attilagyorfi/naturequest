import assert from "node:assert/strict";
import test from "node:test";
import {
  AVATAR_PRESETS,
  CHARACTER_CLASSES,
  onboardingSchema,
  getCharacterClass,
  isOnboardingComplete,
} from "../../src/lib/onboarding";

test("onboardingSchema accepts the three MVP character classes", () => {
  for (const characterClass of ["hunter", "explorer", "chronicler"]) {
    const parsed = onboardingSchema.safeParse({
      characterName: "Bence",
      characterClass,
      avatarPreset: 2,
    });

    assert.equal(parsed.success, true);
  }
});

test("onboardingSchema rejects invalid class and avatar values", () => {
  assert.equal(
    onboardingSchema.safeParse({
      characterName: "Bence",
      characterClass: "wizard",
      avatarPreset: 2,
    }).success,
    false
  );

  assert.equal(
    onboardingSchema.safeParse({
      characterName: "Bence",
      characterClass: "hunter",
      avatarPreset: 99,
    }).success,
    false
  );
});

test("isOnboardingComplete requires all persisted profile fields", () => {
  assert.equal(
    isOnboardingComplete({
      characterName: "Bence",
      characterClass: "hunter",
      avatarPreset: 1,
      onboardingCompletedAt: new Date("2026-04-19T08:00:00.000Z"),
    }),
    true
  );

  assert.equal(
    isOnboardingComplete({
      characterName: "Bence",
      characterClass: null,
      avatarPreset: 1,
      onboardingCompletedAt: new Date("2026-04-19T08:00:00.000Z"),
    }),
    false
  );
});

test("class and avatar definitions stay aligned with MVP scope", () => {
  assert.deepEqual(
    CHARACTER_CLASSES.map((item) => item.id),
    ["hunter", "explorer", "chronicler"]
  );
  assert.equal(AVATAR_PRESETS.length, 6);
  assert.equal(getCharacterClass("explorer")?.label, "Felfedező");
  assert.equal(getCharacterClass("unknown"), undefined);
});
