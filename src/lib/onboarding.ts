import { z } from "zod";

export const CHARACTER_CLASSES = [
  {
    id: "hunter",
    label: "Vadász",
    summary:
      "Gyors, figyelmes nyomkereső, aki apró jelekből rakja össze a választ.",
  },
  {
    id: "explorer",
    label: "Felfedező",
    summary:
      "Kíváncsi térképolvasó, aki új ösvényeket nyit meg Naturaliában.",
  },
  {
    id: "chronicler",
    label: "Krónikás",
    summary: "Történetek őrzője, aki a tudást emlékezetté formálja.",
  },
] as const;

export type CharacterClassId = (typeof CHARACTER_CLASSES)[number]["id"];

export const AVATAR_PRESETS = [
  { id: 0, label: "Borostyán levél" },
  { id: 1, label: "Zöld iránytű" },
  { id: 2, label: "Réz távcső" },
  { id: 3, label: "Kék toll" },
  { id: 4, label: "Arany makk" },
  { id: 5, label: "Ezüst csillag" },
] as const;

export const onboardingSchema = z.object({
  characterName: z
    .string()
    .trim()
    .min(2, "A hős neve legyen legalább 2 karakter.")
    .max(32, "A hős neve legfeljebb 32 karakter lehet."),
  characterClass: z.enum(["hunter", "explorer", "chronicler"], {
    error: "Válassz egy induló rendet.",
  }),
  avatarPreset: z.number().int().min(0).max(5),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

type OnboardingProfile = {
  characterName: string | null;
  characterClass: string | null;
  avatarPreset: number | null;
  onboardingCompletedAt: Date | string | null;
};

export function getCharacterClass(id: string | null | undefined) {
  return CHARACTER_CLASSES.find((item) => item.id === id);
}

export function isOnboardingComplete(
  profile: OnboardingProfile | null | undefined
) {
  return Boolean(
    profile?.characterName &&
      getCharacterClass(profile.characterClass) &&
      typeof profile.avatarPreset === "number" &&
      profile.avatarPreset >= 0 &&
      profile.avatarPreset <= 5 &&
      profile.onboardingCompletedAt
  );
}
