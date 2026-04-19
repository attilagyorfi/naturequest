import assert from "node:assert/strict";
import test from "node:test";
import { getQuestQuiz, isCorrectQuizAnswer } from "../../src/lib/quest-player";

test("getQuestQuiz returns a slug-specific quiz when available", () => {
  const quiz = getQuestQuiz("erdei-nyomkereso");
  assert.equal(quiz.slug, "erdei-nyomkereso");
  assert.equal(quiz.options.length, 3);
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
