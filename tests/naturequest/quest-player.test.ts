import assert from "node:assert/strict";
import test from "node:test";
import {
  canSubmitQuizAnswer,
  getQuestQuiz,
  isCorrectQuizAnswer,
} from "../../src/lib/quest-player";

const seededQuestSlugs = [
  "erdei-nyomkereso",
  "varosi-tortenelmi-seta",
  "mese-es-helyszin",
  "mini-piac-kaland",
];

test("getQuestQuiz returns a slug-specific quiz when available", () => {
  const quiz = getQuestQuiz("erdei-nyomkereso");
  assert.equal(quiz.slug, "erdei-nyomkereso");
  assert.equal(quiz.options.length, 3);
});

test("getQuestQuiz has a dedicated checkpoint for each seeded quest", () => {
  for (const slug of seededQuestSlugs) {
    const quiz = getQuestQuiz(slug);
    assert.equal(quiz.slug, slug);
    assert.equal(quiz.options.length, 3);
    assert.ok(quiz.options.some((option) => option.id === quiz.correctOptionId));
    assert.notEqual(quiz.question, getQuestQuiz("ismeretlen").question);
  }
});

test("getQuestQuiz returns the fallback quiz for unknown slugs", () => {
  const quiz = getQuestQuiz("ismeretlen");
  assert.equal(quiz.slug, "default");
});

test("isCorrectQuizAnswer validates selected option id", () => {
  const quiz = getQuestQuiz("erdei-nyomkereso");
  assert.equal(isCorrectQuizAnswer(quiz, quiz.correctOptionId), true);
  assert.equal(isCorrectQuizAnswer(quiz, "wrong"), false);
});

test("canSubmitQuizAnswer only allows a selected option", () => {
  assert.equal(canSubmitQuizAnswer(null), false);
  assert.equal(canSubmitQuizAnswer(""), false);
  assert.equal(canSubmitQuizAnswer("a"), true);
});
