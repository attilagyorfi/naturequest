import { z } from "zod";

export const QUEST_CONTENT_VERSION = 1 as const;

export const REQUIRED_LOCALES = ["hu", "en"] as const;
export type RequiredLocale = (typeof REQUIRED_LOCALES)[number];

const nonEmptyTrimmedString = z
  .string()
  .trim()
  .min(1, { message: "Must not be empty or whitespace-only." });

const idSchema = z
  .string()
  .trim()
  .min(1, { message: "ID must not be empty." })
  .max(64, { message: "ID must be at most 64 characters." })
  .regex(/^[a-zA-Z0-9._-]+$/, {
    message:
      'ID must contain only letters, numbers, dot, underscore, or hyphen.',
  });

export const localeTextSchema = z.object(
  Object.fromEntries(
    REQUIRED_LOCALES.map((locale) => [locale, nonEmptyTrimmedString])
  ) as Record<RequiredLocale, typeof nonEmptyTrimmedString>
);

export const titleSchema = localeTextSchema;
export type LocaleText = z.infer<typeof localeTextSchema>;

// INTRO
export const introSchema = localeTextSchema;
export type Intro = z.infer<typeof introSchema>;

// SECTIONS
const imageKeySchema = z
  .string()
  .regex(/^[a-z0-9_]+(\/[a-z0-9_]+)+$/, {
    message:
      'imageKey must be slash-separated lowercase slugs (e.g. "natura/tanulok_ligete/s1").',
  });

export const narrativeSectionSchema = z
  .object({
    id: idSchema,
    type: z.literal("narrative"),
    body: localeTextSchema,
    imageKey: imageKeySchema.optional(),
  })
  .strict();

export type NarrativeSection = z.infer<typeof narrativeSectionSchema>;

export const sectionSchema = z.discriminatedUnion("type", [
  narrativeSectionSchema,
]);

export type Section = z.infer<typeof sectionSchema>;

// QUIZ
export const answerSchema = z
  .object({
    id: idSchema,
    text: localeTextSchema,
    correct: z.boolean(),
  })
  .strict();

export type Answer = z.infer<typeof answerSchema>;

export const questionSchema = z
  .object({
    id: idSchema,
    prompt: localeTextSchema,
    answers: z.array(answerSchema),
    explanation: localeTextSchema,
  })
  .strict()
  .superRefine((question, ctx) => {
    if (question.answers.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: "Each question must have exactly 4 answers.",
      });
    }

    const correctCount = question.answers.filter((a) => a.correct).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: `Each question must have exactly 1 correct answer (found ${correctCount}).`,
      });
    }

    const seen = new Set<string>();
    question.answers.forEach((answer, idx) => {
      if (seen.has(answer.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers", idx, "id"],
          message: `Duplicate answer id "${answer.id}" in question.`,
        });
      }
      seen.add(answer.id);
    });
  });

export type Question = z.infer<typeof questionSchema>;

export const quizSchema = z
  .object({
    questions: z
      .array(questionSchema)
      .min(1, { message: "Quiz must have at least 1 question." })
      .max(10, { message: "Quiz must have at most 10 questions." }),
  })
  .strict()
  .superRefine((quiz, ctx) => {
    const seen = new Set<string>();
    quiz.questions.forEach((question, idx) => {
      if (seen.has(question.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "id"],
          message: `Duplicate question id "${question.id}" in quiz.`,
        });
      }
      seen.add(question.id);
    });
  });

export type Quiz = z.infer<typeof quizSchema>;

// ROOT QUEST CONTENT
export const questContentSchema = z
  .object({
    version: z.literal(QUEST_CONTENT_VERSION),
    title: titleSchema,
    intro: introSchema,
    sections: z
      .array(sectionSchema)
      .min(1, { message: "Quest must have at least 1 section." })
      .max(10, { message: "Quest must have at most 10 sections." }),
    quiz: quizSchema,
  })
  .strict()
  .superRefine((content, ctx) => {
    const seen = new Set<string>();
    content.sections.forEach((section, idx) => {
      if (seen.has(section.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sections", idx, "id"],
          message: `Duplicate section id "${section.id}" in quest.`,
        });
      }
      seen.add(section.id);
    });
  });

export type QuestContent = z.infer<typeof questContentSchema>;

// ANSWERS LOG
export const answerLogEntrySchema = z
  .object({
    qId: idSchema,
    aId: idSchema,
    correct: z.boolean(),
    answeredAt: z.string().datetime(),
  })
  .strict();

export const answersLogSchema = z
  .object({
    answers: z.array(answerLogEntrySchema),
  })
  .strict();

export type AnswerLogEntry = z.infer<typeof answerLogEntrySchema>;
export type AnswersLog = z.infer<typeof answersLogSchema>;

// VALIDATION HELPERS
export interface QuestContentIssue {
  path: string;
  message: string;
}

export type QuestContentValidationResult =
  | { success: true; data: QuestContent }
  | { success: false; issues: QuestContentIssue[] };

export function validateQuestContent(
  input: unknown
): QuestContentValidationResult {
  const result = questContentSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues: QuestContentIssue[] = result.error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));

  return { success: false, issues };
}

export function assertQuestContent(
  input: unknown,
  questId?: string
): QuestContent {
  const result = validateQuestContent(input);

  if (result.success) return result.data;

  const header = questId
    ? `Invalid quest content in "${questId}":`
    : "Invalid quest content:";

  const formatted = result.issues
    .map((issue, index) => `  ${index + 1}. [${issue.path}] ${issue.message}`)
    .join("\n");

  throw new Error(`${header}\n${formatted}`);
}

// VALID SAMPLES
export const sampleValidQuest1: QuestContent = {
  version: QUEST_CONTENT_VERSION,
  title: {
    hu: "Köszöntő",
    en: "Welcome",
  },
  intro: {
    hu: "Rhea Árnyvetélő a liget szélén vár. Nem szól sokat — csak egy bólintással jelzi, hogy jöhetsz.",
    en: "Rhea Shadowthrower waits at the edge of the grove. She says little — just a nod tells you to come.",
  },
  sections: [
    {
      id: "s1",
      type: "narrative",
      body: {
        hu: "A liget fái nem közönséges fák. Néhány közülük emlékszik még a Hallgatóra.",
        en: "The trees of this grove are not ordinary. Some of them still remember the Listener.",
      },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: {
          hu: "Melyik fa nem őshonos Magyarországon?",
          en: "Which tree is not native to Hungary?",
        },
        answers: [
          {
            id: "a1",
            text: { hu: "Tölgy", en: "Oak" },
            correct: false,
          },
          {
            id: "a2",
            text: { hu: "Bükk", en: "Beech" },
            correct: false,
          },
          {
            id: "a3",
            text: { hu: "Eukaliptusz", en: "Eucalyptus" },
            correct: true,
          },
          {
            id: "a4",
            text: { hu: "Juhar", en: "Maple" },
            correct: false,
          },
        ],
        explanation: {
          hu: "Az eukaliptusz Ausztráliában őshonos.",
          en: "Eucalyptus is native to Australia.",
        },
      },
    ],
  },
};

export const sampleValidQuest2: QuestContent = {
  version: QUEST_CONTENT_VERSION,
  title: {
    hu: "Kő a ködben",
    en: "Stone in the Fog",
  },
  intro: {
    hu: "A köd sűrű. Egy kő sem néz ki kőnek. Mégis — mindegyik valamire emlékszik.",
    en: "The fog is thick. No stone looks like a stone. Yet — each of them remembers something.",
  },
  sections: [
    {
      id: "intro_stone",
      type: "narrative",
      body: {
        hu: "A ködben egy kő halkan világít. Ha közelebb hajolsz, szinte hallod, ahogy emlékezik.",
        en: "In the fog, a stone glows softly. If you lean closer, you can almost hear it remembering.",
      },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: {
          hu: "Mitől függ egy élőhely biodiverzitása leginkább?",
          en: "What most affects the biodiversity of a habitat?",
        },
        answers: [
          {
            id: "a1",
            text: { hu: "A hőmérséklet", en: "Temperature" },
            correct: false,
          },
          {
            id: "a2",
            text: {
              hu: "A fajok közötti kapcsolatok sokfélesége",
              en: "The variety of relationships between species",
            },
            correct: true,
          },
          {
            id: "a3",
            text: { hu: "A talaj színe", en: "The color of the soil" },
            correct: false,
          },
          {
            id: "a4",
            text: {
              hu: "A terület nagysága önmagában",
              en: "The size of the area alone",
            },
            correct: false,
          },
        ],
        explanation: {
          hu: "A biodiverzitás nem csupán fajszám — a fajok közötti kapcsolatok hálózata adja a rendszer stabilitását.",
          en: "Biodiversity is not just species count — the network of relationships between species gives the system its stability.",
        },
      },
    ],
  },
};

// INVALID SAMPLES
export const sampleInvalidQuest_missingTitle: unknown = {
  version: QUEST_CONTENT_VERSION,
  intro: { hu: "Intro.", en: "Intro." },
  sections: [
    {
      id: "s1",
      type: "narrative",
      body: { hu: "Szöveg.", en: "Text." },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: { hu: "Kérdés?", en: "Question?" },
        answers: [
          { id: "a1", text: { hu: "A", en: "A" }, correct: true },
          { id: "a2", text: { hu: "B", en: "B" }, correct: false },
          { id: "a3", text: { hu: "C", en: "C" }, correct: false },
          { id: "a4", text: { hu: "D", en: "D" }, correct: false },
        ],
        explanation: { hu: "Magyarázat.", en: "Explanation." },
      },
    ],
  },
};

export const sampleInvalidQuest_twoCorrectAnswers: unknown = {
  version: QUEST_CONTENT_VERSION,
  title: { hu: "Teszt", en: "Test" },
  intro: { hu: "Teszt intro.", en: "Test intro." },
  sections: [
    {
      id: "s1",
      type: "narrative",
      body: { hu: "Szöveg.", en: "Text." },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: { hu: "Kérdés?", en: "Question?" },
        answers: [
          { id: "a1", text: { hu: "A", en: "A" }, correct: true },
          { id: "a2", text: { hu: "B", en: "B" }, correct: true },
          { id: "a3", text: { hu: "C", en: "C" }, correct: false },
          { id: "a4", text: { hu: "D", en: "D" }, correct: false },
        ],
        explanation: { hu: "Magyarázat.", en: "Explanation." },
      },
    ],
  },
};

export const sampleInvalidQuest_duplicateSectionIds: unknown = {
  version: QUEST_CONTENT_VERSION,
  title: { hu: "Teszt", en: "Test" },
  intro: { hu: "Intro.", en: "Intro." },
  sections: [
    {
      id: "s1",
      type: "narrative",
      body: { hu: "Első.", en: "First." },
    },
    {
      id: "s1",
      type: "narrative",
      body: { hu: "Második.", en: "Second." },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: { hu: "Kérdés?", en: "Question?" },
        answers: [
          { id: "a1", text: { hu: "A", en: "A" }, correct: true },
          { id: "a2", text: { hu: "B", en: "B" }, correct: false },
          { id: "a3", text: { hu: "C", en: "C" }, correct: false },
          { id: "a4", text: { hu: "D", en: "D" }, correct: false },
        ],
        explanation: { hu: "Magyarázat.", en: "Explanation." },
      },
    ],
  },
};

export const sampleInvalidQuest_threeAnswersAndEmptyText: unknown = {
  version: QUEST_CONTENT_VERSION,
  title: { hu: "Teszt", en: "Test" },
  intro: { hu: "Intro.", en: "Intro." },
  sections: [
    {
      id: "s1",
      type: "narrative",
      body: { hu: "Szöveg.", en: "Text." },
    },
  ],
  quiz: {
    questions: [
      {
        id: "q1",
        prompt: { hu: "   ", en: "Question?" },
        answers: [
          { id: "a1", text: { hu: "A", en: "A" }, correct: true },
          { id: "a2", text: { hu: "B", en: "B" }, correct: false },
          { id: "a3", text: { hu: "C", en: "C" }, correct: false },
        ],
        explanation: { hu: "Magyarázat.", en: "Explanation." },
      },
    ],
  },
};