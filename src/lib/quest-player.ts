export type QuestQuiz = {
  slug: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
  }>;
  correctOptionId: string;
  successText: string;
  retryText: string;
};

const DEFAULT_QUIZ: QuestQuiz = {
  slug: "default",
  question: "Mi a NatureQuest egyik alapszabálya?",
  options: [
    { id: "a", label: "A tudás új ösvényeket nyit." },
    { id: "b", label: "A gyors kattintás mindig elég." },
    { id: "c", label: "A hibák miatt véget ér a kaland." },
  ],
  correctOptionId: "a",
  successText: "Jól figyeltél. A tudás valóban kapukat nyit.",
  retryText: "Ez most tanulási lehetőség. Próbáld újra nyugodtan.",
};

const QUIZZES: Record<string, QuestQuiz> = {
  "erdei-nyomkereso": {
    slug: "erdei-nyomkereso",
    question: "Mit érdemes keresni egy erdei megfigyelésnél?",
    options: [
      { id: "a", label: "Csak a legnagyobb fákat." },
      { id: "b", label: "Apró nyomokat, hangokat és formákat." },
      { id: "c", label: "Csak azt, amit már előre ismersz." },
    ],
    correctOptionId: "b",
    successText: "Pontosan. A természet apró jelekben beszél.",
    retryText: "Nézd meg újra a lépéseket: a részletek számítanak.",
  },
};

export function getQuestQuiz(slug: string) {
  return QUIZZES[slug] ?? DEFAULT_QUIZ;
}

export function isCorrectQuizAnswer(
  quiz: QuestQuiz,
  selectedOptionId: string | null
) {
  return selectedOptionId === quiz.correctOptionId;
}
