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
  "varosi-tortenelmi-seta": {
    slug: "varosi-tortenelmi-seta",
    question: "Mi segít legjobban megérteni egy történelmi helyszínt?",
    options: [
      { id: "a", label: "Csak gyorsan lefotózni és továbbmenni." },
      { id: "b", label: "Megfigyelni a részleteket és utánanézni a történetének." },
      { id: "c", label: "Csak azt leírni, hogy régi épületnek tűnik." },
    ],
    correctOptionId: "b",
    successText: "Igen. A múlt akkor kel életre, ha kérdéseket teszünk fel.",
    retryText: "Keresd a dátumokat, neveket és jeleket. Ezek vezetnek a történethez.",
  },
  "mese-es-helyszin": {
    slug: "mese-es-helyszin",
    question: "Mitől lesz erős egy mese és egy valós helyszín kapcsolata?",
    options: [
      { id: "a", label: "Ha a hely hangulata illik a történethez." },
      { id: "b", label: "Ha teljesen véletlenszerű helyet választasz." },
      { id: "c", label: "Ha nem gondolsz a szereplőkre és a környezetre." },
    ],
    correctOptionId: "a",
    successText: "Szép munka. A jó helyszín erősíti a történet hangulatát.",
    retryText: "Gondolj a szereplőkre, a hangulatra és arra, hol éreznék otthon magukat.",
  },
  "mini-piac-kaland": {
    slug: "mini-piac-kaland",
    question: "Mi alapján érdemes dönteni vásárláskor?",
    options: [
      { id: "a", label: "Mindig csak az ár alapján." },
      { id: "b", label: "A szükséglet, az érték és a lehetőségek együtt számítanak." },
      { id: "c", label: "Az alapján, melyik termék van legközelebb." },
    ],
    correctOptionId: "b",
    successText: "Pontosan. A jó döntés több szempontot mérlegel.",
    retryText: "Ne csak az árat figyeld. Gondold végig, mire van szükség és mit kapsz érte.",
  },
};

export function getQuestQuiz(slug: string) {
  return QUIZZES[slug] ?? DEFAULT_QUIZ;
}

export function canSubmitQuizAnswer(selectedOptionId: string | null) {
  return Boolean(selectedOptionId);
}

export function isCorrectQuizAnswer(
  quiz: QuestQuiz,
  selectedOptionId: string | null
) {
  return selectedOptionId === quiz.correctOptionId;
}
