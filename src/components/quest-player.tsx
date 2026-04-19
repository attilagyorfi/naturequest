"use client";

import { useState } from "react";
import {
  canSubmitQuizAnswer,
  getQuestQuiz,
  isCorrectQuizAnswer,
} from "@/lib/quest-player";
import RewardPanel from "@/components/reward-panel";

type Step = {
  id: string;
  title: string;
  description: string;
  stepOrder: number;
};

type Badge = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  slug: string;
  steps: Step[];
};

export default function QuestPlayer({ slug, steps }: Props) {
  const quiz = getQuestQuiz(slug);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizMessage, setQuizMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState<{
    message: string;
    totalPoints: number | null;
    previousLevel: number | null;
    level: number | null;
    leveledUp: boolean;
    xpUntilNextLevel: number | null;
    pointsReward: number | null;
    badges: Badge[];
  } | null>(null);

  const currentStep = steps[stepIndex];
  const stepsDone = stepIndex >= steps.length;
  const canCompleteQuest = canSubmitQuizAnswer(selectedOptionId);

  async function completeQuest() {
    if (!canCompleteQuest) {
      setQuizMessage("Válassz egy választ, mielőtt lezárod a küldetést.");
      return;
    }

    if (!isCorrectQuizAnswer(quiz, selectedOptionId)) {
      setQuizMessage(quiz.retryText);
      return;
    }

    setLoading(true);
    setQuizMessage(quiz.successText);

    const response = await fetch(`/api/quests/${slug}/complete`, {
      method: "POST",
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.success) {
      setReward({
        message: data.message ?? "Nem sikerült lezárni a küldetést.",
        totalPoints: null,
        previousLevel: null,
        level: null,
        leveledUp: false,
        xpUntilNextLevel: null,
        pointsReward: null,
        badges: [],
      });
      return;
    }

    setReward({
      message: data.message ?? "Küldetés teljesítve.",
      totalPoints: data.data?.totalPoints ?? data.data?.points ?? null,
      previousLevel: data.data?.previousLevel ?? null,
      level: data.data?.level ?? null,
      leveledUp: data.data?.leveledUp ?? false,
      xpUntilNextLevel: data.data?.xpUntilNextLevel ?? null,
      pointsReward: data.data?.pointsReward ?? null,
      badges: data.data?.badges ?? [],
    });
  }

  if (reward) {
    return <RewardPanel {...reward} />;
  }

  return (
    <section className="rounded-lg border border-[#d9c8a4] bg-white p-6">
      {!stepsDone && currentStep ? (
        <>
          <p className="text-sm font-semibold text-[#7b5f2e]">
            {currentStep.stepOrder}. lépés / {steps.length}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{currentStep.title}</h2>
          <p className="mt-3 text-[#52645c]">{currentStep.description}</p>
          <button
            type="button"
            onClick={() => setStepIndex((value) => value + 1)}
            className="mt-5 rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
          >
            Következő lépés
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">{quiz.question}</h2>
          <div className="mt-4 grid gap-3">
            {quiz.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedOptionId(option.id);
                  setQuizMessage(null);
                }}
                className={`rounded-lg border p-4 text-left ${
                  selectedOptionId === option.id
                    ? "border-[#1b4332] bg-[#e5f1e8]"
                    : "border-[#d9c8a4]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {quizMessage ? (
            <p className="mt-4 text-sm text-[#52645c]">{quizMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={completeQuest}
            disabled={loading || !canCompleteQuest}
            className="mt-5 rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Küldetés lezárása..." : "Küldetés befejezése"}
          </button>
          {!canCompleteQuest ? (
            <p className="mt-2 text-xs text-[#7b5f2e]">
              Válassz egy lehetőséget a befejezéshez.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
