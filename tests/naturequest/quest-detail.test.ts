import assert from "node:assert/strict";
import test from "node:test";
import { formatDurationLabel } from "../../src/lib/quest-detail";

test("formatDurationLabel formats short audio guides in seconds", () => {
  assert.equal(formatDurationLabel(45), "45 mp");
});

test("formatDurationLabel omits seconds for exact minutes", () => {
  assert.equal(formatDurationLabel(120), "2 perc");
});

test("formatDurationLabel keeps both minutes and seconds when needed", () => {
  assert.equal(formatDurationLabel(95), "1 perc 35 mp");
});
