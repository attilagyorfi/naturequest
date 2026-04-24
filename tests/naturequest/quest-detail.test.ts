import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDurationLabel,
  resolveLocalAssetPath,
} from "../../src/lib/quest-detail";

test("formatDurationLabel formats short audio guides in seconds", () => {
  assert.equal(formatDurationLabel(45), "45 mp");
});

test("formatDurationLabel omits seconds for exact minutes", () => {
  assert.equal(formatDurationLabel(120), "2 perc");
});

test("formatDurationLabel keeps both minutes and seconds when needed", () => {
  assert.equal(formatDurationLabel(95), "1 perc 35 mp");
});

test("resolveLocalAssetPath keeps the original path when it exists", () => {
  const existingFiles = new Set(["/quests/erdei-nyomkereso.jpg"]);
  assert.equal(
    resolveLocalAssetPath("/quests/erdei-nyomkereso.jpg", existingFiles),
    "/quests/erdei-nyomkereso.jpg"
  );
});

test("resolveLocalAssetPath falls back to another supported extension", () => {
  const existingFiles = new Set(["/quests/erdei-nyomkereso.png"]);
  assert.equal(
    resolveLocalAssetPath("/quests/erdei-nyomkereso.jpg", existingFiles),
    "/quests/erdei-nyomkereso.png"
  );
});
