# NatureQuest MVP Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable NatureQuest MVP loop: gateway -> onboarding -> dashboard -> quest player -> reward feedback.

**Architecture:** Keep the existing Next.js 16 App Router, Auth.js, Prisma, and route-handler patterns. Add a small onboarding state to `Profile`, keep quest completion centralized in `src/lib/quest-completion.ts`, and isolate new client behavior in focused components and pure helpers.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript, Tailwind CSS 4, Auth.js beta, Prisma 7, PostgreSQL, Zod, Node `tsx --test`.

---

## File Structure

- Modify `prisma/schema.prisma`: add nullable onboarding fields to `Profile`.
- Create `prisma/migrations/<timestamp>_add_profile_onboarding/migration.sql`: add the four profile columns.
- Modify `prisma/seed.ts`: repair touched Hungarian seed text and set admin onboarding fields.
- Create `src/lib/onboarding.ts`: class definitions, avatar definitions, Zod schema, `isOnboardingComplete()`.
- Create `tests/naturequest/onboarding.test.ts`: pure tests for onboarding validation and completion state.
- Create `src/lib/dashboard.ts`: recommended quest selector and dashboard view helpers.
- Create `tests/naturequest/dashboard.test.ts`: pure tests for recommended quest selection.
- Create `src/lib/quest-player.ts`: MVP quiz map and answer validation helpers.
- Create `tests/naturequest/quest-player.test.ts`: pure tests for quiz lookup and answer validation.
- Create `app/api/onboarding/route.ts`: authenticated profile update endpoint.
- Create `app/onboarding/page.tsx`: guarded onboarding page.
- Create `src/components/onboarding-form.tsx`: client onboarding form.
- Modify `app/page.tsx`: replace default Next landing with NatureQuest gateway.
- Modify `app/layout.tsx`: NatureQuest metadata and Hungarian lang.
- Modify `src/components/navbar.tsx`: repair Hungarian labels and use existing auth state.
- Modify `app/dashboard/page.tsx`: complete personalized dashboard and onboarding redirect.
- Modify `app/quests/page.tsx`: remove duplicated header, repair copy, show completion state when signed in.
- Modify `app/quests/[slug]/page.tsx`: render quest player shell.
- Create `src/components/quest-player.tsx`: guided stepper, quiz checkpoint, completion call.
- Create `src/components/reward-panel.tsx`: reward/already-completed display.
- Modify `src/components/complete-quest-button.tsx`: delete it when it has no imports after quest-player migration; otherwise repair its copy.
- Modify `app/api/register/route.ts`, `src/auth.ts`, `src/components/login-form.tsx`, `src/components/register-form.tsx`: repair touched Hungarian copy and redirect targets where needed.
- Modify `package.json`: add `test:naturequest`.

---

### Task 1: Add Pure Onboarding Domain Helper

**Files:**
- Create: `src/lib/onboarding.ts`
- Create: `tests/naturequest/onboarding.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing onboarding tests**

Create `tests/naturequest/onboarding.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
corepack pnpm exec tsx --test tests/naturequest/onboarding.test.ts
```

Expected: FAIL because `src/lib/onboarding.ts` does not exist.

- [ ] **Step 3: Implement the onboarding helper**

Create `src/lib/onboarding.ts`:

```ts
import { z } from "zod";

export const CHARACTER_CLASSES = [
  {
    id: "hunter",
    label: "Vadász",
    summary: "Gyors, figyelmes nyomkereső, aki apró jelekből rakja össze a választ.",
  },
  {
    id: "explorer",
    label: "Felfedező",
    summary: "Kíváncsi térképolvasó, aki új ösvényeket nyit meg Naturaliában.",
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

export function isOnboardingComplete(profile: OnboardingProfile | null | undefined) {
  return Boolean(
    profile?.characterName &&
      getCharacterClass(profile.characterClass) &&
      typeof profile.avatarPreset === "number" &&
      profile.avatarPreset >= 0 &&
      profile.avatarPreset <= 5 &&
      profile.onboardingCompletedAt
  );
}
```

- [ ] **Step 4: Add a package script for NatureQuest tests**

Modify `package.json` scripts:

```json
"test:naturequest": "tsx --test tests/naturequest/*.test.ts"
```

Keep the test scripts focused on NatureQuest.

- [ ] **Step 5: Run the tests to verify they pass**

Run:

```powershell
corepack pnpm run test:naturequest
```

Expected: PASS for `onboarding.test.ts`.

- [ ] **Step 6: Commit**

Run:

```powershell
git add package.json src/lib/onboarding.ts tests/naturequest/onboarding.test.ts
git commit -m "Add NatureQuest onboarding domain helper"
```

Expected: commit succeeds with only these files staged.

---

### Task 2: Add Profile Onboarding Persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_profile_onboarding/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update Prisma schema**

Modify the `Profile` model in `prisma/schema.prisma`:

```prisma
model Profile {
  id                    String    @id @default(cuid())
  userId                String    @unique
  avatarUrl             String?
  age                   Int?
  favoriteTopic         String?
  parentName            String?
  prefersAudio          Boolean   @default(false)
  characterName         String?
  characterClass        String?
  avatarPreset          Int?
  onboardingCompletedAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Create migration**

Run:

```powershell
corepack pnpm prisma migrate dev --name add_profile_onboarding
```

Expected: Prisma creates `prisma/migrations/<timestamp>_add_profile_onboarding/migration.sql` and regenerates the client.

The migration SQL should contain:

```sql
ALTER TABLE "Profile" ADD COLUMN "characterName" TEXT;
ALTER TABLE "Profile" ADD COLUMN "characterClass" TEXT;
ALTER TABLE "Profile" ADD COLUMN "avatarPreset" INTEGER;
ALTER TABLE "Profile" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);
```

- [ ] **Step 3: Repair touched seed copy and give admin onboarding state**

In `prisma/seed.ts`, repair only strings touched in this task. For the admin user profile, use:

```ts
profile: {
  create: {
    avatarUrl: "/avatars/admin.png",
    favoriteTopic: "Rendszerkezelés",
    prefersAudio: true,
    characterName: "Admin Krónikás",
    characterClass: "chronicler",
    avatarPreset: 3,
    onboardingCompletedAt: new Date(),
  },
},
```

Do not rewrite all seed content in this task unless TypeScript errors require it.

- [ ] **Step 4: Verify Prisma and tests**

Run:

```powershell
corepack pnpm run test:naturequest
corepack pnpm run build
```

Expected: NatureQuest tests pass. Build should pass or fail only on pre-existing unrelated app issues; if it fails due to new `Profile` fields, fix those type errors in this task.

- [ ] **Step 5: Commit**

Run:

```powershell
git add prisma/schema.prisma prisma/migrations prisma/seed.ts
git commit -m "Add onboarding fields to profiles"
```

Expected: commit succeeds with schema, migration, and seed changes.

---

### Task 3: Build Onboarding API and Page

**Files:**
- Create: `app/api/onboarding/route.ts`
- Create: `app/onboarding/page.tsx`
- Create: `src/components/onboarding-form.tsx`

- [ ] **Step 1: Add API route**

Create `app/api/onboarding/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/onboarding";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Bejelentkezés szükséges." },
      { status: 401 }
    );
  }

  const parsed = onboardingSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Hibás karakteradatok.",
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "A felhasználó nem található." },
      { status: 404 }
    );
  }

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
    create: {
      userId: user.id,
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "A hősöd készen áll.",
  });
}
```

- [ ] **Step 2: Add onboarding page**

Create `app/onboarding/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOnboardingComplete } from "@/lib/onboarding";
import OnboardingForm from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (isOnboardingComplete(user.profile)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
            Naturalia kapuja
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Mielőtt belépsz, válaszd ki, milyen hősként tanulsz.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#42584d]">
            A tudás itt nem lecke, hanem erő. Az első rend csak az indulás:
            minden jó válasz új ösvényt nyit.
          </p>
        </section>

        <OnboardingForm defaultName={user.name ?? ""} />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add onboarding client form**

Create `src/components/onboarding-form.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { AVATAR_PRESETS, CHARACTER_CLASSES } from "@/lib/onboarding";

type Props = {
  defaultName: string;
};

export default function OnboardingForm({ defaultName }: Props) {
  const [characterName, setCharacterName] = useState(defaultName);
  const [characterClass, setCharacterClass] = useState("hunter");
  const [avatarPreset, setAvatarPreset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterName, characterClass, avatarPreset }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.success) {
      setError(data.message ?? "Nem sikerült elmenteni a hősödet.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#d9c8a4] bg-white p-6 shadow-sm">
      <label className="block text-sm font-semibold text-[#193226]" htmlFor="characterName">
        Hős neve
      </label>
      <input
        id="characterName"
        value={characterName}
        onChange={(event) => setCharacterName(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#cbb98f] px-4 py-3 outline-none focus:border-[#1b4332]"
        required
      />

      <div className="mt-6 grid gap-3">
        {CHARACTER_CLASSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCharacterClass(item.id)}
            className={`rounded-lg border p-4 text-left transition ${
              characterClass === item.id
                ? "border-[#1b4332] bg-[#e5f1e8]"
                : "border-[#d9c8a4] bg-white hover:border-[#7b5f2e]"
            }`}
          >
            <span className="font-semibold">{item.label}</span>
            <span className="mt-1 block text-sm text-[#52645c]">{item.summary}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {AVATAR_PRESETS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => setAvatarPreset(avatar.id)}
            className={`rounded-lg border px-3 py-4 text-sm font-semibold ${
              avatarPreset === avatar.id
                ? "border-[#1b4332] bg-[#1b4332] text-white"
                : "border-[#d9c8a4] bg-[#fffaf0] text-[#193226]"
            }`}
          >
            {avatar.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white hover:bg-[#255f46] disabled:opacity-60"
      >
        {loading ? "Hős feljegyzése..." : "Belépek Naturaliába"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Verify route compiles**

Run:

```powershell
corepack pnpm run test:naturequest
corepack pnpm run lint
```

Expected: NatureQuest tests pass and lint does not report errors in the new files.

- [ ] **Step 5: Commit**

Run:

```powershell
git add app/api/onboarding/route.ts app/onboarding/page.tsx src/components/onboarding-form.tsx
git commit -m "Add NatureQuest onboarding flow"
```

Expected: commit succeeds with onboarding files only.

---

### Task 4: Replace Gateway and Repair Auth-Facing Copy

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `src/components/navbar.tsx`
- Modify: `src/auth.ts`
- Modify: `app/api/register/route.ts`
- Modify: `src/components/login-form.tsx`
- Modify: `src/components/register-form.tsx`

- [ ] **Step 1: Replace root page**

Replace `app/page.tsx` with a server component that uses `auth()`:

```tsx
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const primaryHref = session?.user ? "/dashboard" : "/register";
  const secondaryHref = session?.user ? "/quests" : "/login";

  return (
    <main className="min-h-screen bg-[#f6f0e4] text-[#193226]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
          NatureQuest
        </p>
        <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          A tudás itt kalanddá változik.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#42584d]">
          Lépj be Naturaliába, válassz rendet, teljesíts küldetéseket, és
          gyűjts erőt minden új felfedezéssel.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={primaryHref} className="rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white">
            {session?.user ? "Vissza a kalandhoz" : "Kaland indítása"}
          </Link>
          <Link href={secondaryHref} className="rounded-lg border border-[#b99555] px-5 py-3 font-semibold text-[#193226]">
            {session?.user ? "Küldetések böngészése" : "Már van fiókom"}
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Update metadata and language**

In `app/layout.tsx`, set:

```ts
export const metadata: Metadata = {
  title: "NatureQuest",
  description: "Gamifikált edukációs kalandplatform gyerekeknek.",
};
```

Set the HTML language to Hungarian:

```tsx
<html lang="hu" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

- [ ] **Step 3: Repair Hungarian copy in touched auth files**

Replace mojibake strings only in the touched files. Use these exact messages:

```ts
"Érvényes email cím szükséges."
"A jelszó túl rövid."
"Jelszó"
"A név túl rövid."
"Adj meg érvényes email címet."
"A jelszónak legalább 8 karakter hosszúnak kell lennie."
"Hibás adatok."
"Ezzel az email címmel már létezik felhasználó."
"Sikeres regisztráció."
"Hiba történt a regisztráció során."
```

In `src/components/login-form.tsx`, remove hard-coded demo credentials by initializing both fields with empty strings.

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm run lint
corepack pnpm run build
```

Expected: lint/build pass, or any failure is unrelated to this task and documented before proceeding.

- [ ] **Step 5: Commit**

Run:

```powershell
git add app/page.tsx app/layout.tsx src/components/navbar.tsx src/auth.ts app/api/register/route.ts src/components/login-form.tsx src/components/register-form.tsx
git commit -m "Replace NatureQuest gateway and repair auth copy"
```

Expected: commit succeeds with gateway/auth-facing copy changes.

---

### Task 5: Build Dashboard Recommendation Logic

**Files:**
- Create: `src/lib/dashboard.ts`
- Create: `tests/naturequest/dashboard.test.ts`

- [ ] **Step 1: Write failing dashboard helper tests**

Create `tests/naturequest/dashboard.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { selectRecommendedQuest } from "../../src/lib/dashboard";

const quests = [
  { id: "q1", slug: "erdei-nyomkereso", title: "Erdei nyomkereső" },
  { id: "q2", slug: "varosi-tortenelmi-seta", title: "Városi történelmi séta" },
  { id: "q3", slug: "mese-es-helyszin", title: "Mese és helyszín" },
];

test("selectRecommendedQuest picks the first incomplete quest", () => {
  assert.equal(selectRecommendedQuest(quests, new Set(["q1"]))?.id, "q2");
});

test("selectRecommendedQuest returns null when every quest is complete", () => {
  assert.equal(selectRecommendedQuest(quests, new Set(["q1", "q2", "q3"])), null);
});

test("selectRecommendedQuest handles an empty quest list", () => {
  assert.equal(selectRecommendedQuest([], new Set()), null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
corepack pnpm exec tsx --test tests/naturequest/dashboard.test.ts
```

Expected: FAIL because `src/lib/dashboard.ts` does not exist.

- [ ] **Step 3: Implement dashboard helper**

Create `src/lib/dashboard.ts`:

```ts
type QuestLike = {
  id: string;
};

export function selectRecommendedQuest<TQuest extends QuestLike>(
  quests: TQuest[],
  completedQuestIds: Set<string>
) {
  return quests.find((quest) => !completedQuestIds.has(quest.id)) ?? null;
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm run test:naturequest
```

Expected: onboarding and dashboard tests pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src/lib/dashboard.ts tests/naturequest/dashboard.test.ts
git commit -m "Add dashboard quest recommendation helper"
```

Expected: commit succeeds.

---

### Task 6: Complete Personalized Dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Implement onboarding guard and dashboard query**

Replace the current incomplete `app/dashboard/page.tsx` content with a server component that:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCharacterClass, isOnboardingComplete } from "@/lib/onboarding";
import { selectRecommendedQuest } from "@/lib/dashboard";
import SignOutButton from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      userBadges: { include: { badge: true }, orderBy: { awardedAt: "desc" } },
      questProgress: {
        where: { status: "COMPLETED" },
        include: { quest: { include: { category: true } } },
        orderBy: { completedAt: "desc" },
      },
      achievements: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!isOnboardingComplete(user.profile)) {
    redirect("/onboarding");
  }

  const quests = await prisma.quest.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: [{ createdAt: "asc" }],
  });

  const completedQuestIds = new Set(user.questProgress.map((item) => item.questId));
  const recommendedQuest = selectRecommendedQuest(quests, completedQuestIds);
  const characterClass = getCharacterClass(user.profile?.characterClass);

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
              Hőstábla
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {user.profile?.characterName}
            </h1>
            <p className="mt-2 text-[#52645c]">
              {characterClass?.label ?? "Hős"} | {user.level}. szint | {user.points} XP
            </p>
          </div>
          <SignOutButton />
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Teljesített küldetések</p>
            <p className="mt-2 text-3xl font-bold">{user.questProgress.length}</p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Badge-ek</p>
            <p className="mt-2 text-3xl font-bold">{user.userBadges.length}</p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Következő cél</p>
            <p className="mt-2 text-3xl font-bold">{recommendedQuest ? "+XP" : "Pihenő"}</p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
            Ajánlott ösvény
          </p>
          {recommendedQuest ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">{recommendedQuest.title}</h2>
              <p className="mt-3 max-w-2xl text-[#52645c]">{recommendedQuest.shortDescription}</p>
              <Link
                href={`/quests/${recommendedQuest.slug}`}
                className="mt-5 inline-flex rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
              >
                Folytasd a kalandot
              </Link>
            </>
          ) : (
            <p className="mt-3 text-[#52645c]">
              A Krónikások most készítik a következő ösvényt. Nézz vissza hamarosan.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run:

```powershell
corepack pnpm run lint
corepack pnpm run build
```

Expected: lint/build pass.

- [ ] **Step 3: Commit**

Run:

```powershell
git add app/dashboard/page.tsx
git commit -m "Complete NatureQuest dashboard hub"
```

Expected: commit succeeds.

---

### Task 7: Add Quest Player Domain Helper

**Files:**
- Create: `src/lib/quest-player.ts`
- Create: `tests/naturequest/quest-player.test.ts`

- [ ] **Step 1: Write failing quest-player tests**

Create `tests/naturequest/quest-player.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
corepack pnpm exec tsx --test tests/naturequest/quest-player.test.ts
```

Expected: FAIL because `src/lib/quest-player.ts` does not exist.

- [ ] **Step 3: Implement quest-player helper**

Create `src/lib/quest-player.ts`:

```ts
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

export function isCorrectQuizAnswer(quiz: QuestQuiz, selectedOptionId: string | null) {
  return selectedOptionId === quiz.correctOptionId;
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm run test:naturequest
```

Expected: all NatureQuest pure tests pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src/lib/quest-player.ts tests/naturequest/quest-player.test.ts
git commit -m "Add MVP quest quiz helper"
```

Expected: commit succeeds.

---

### Task 8: Build Quest Player UI and Reward Panel

**Files:**
- Create: `src/components/reward-panel.tsx`
- Create: `src/components/quest-player.tsx`
- Modify: `app/quests/[slug]/page.tsx`

- [ ] **Step 1: Create reward panel**

Create `src/components/reward-panel.tsx`:

```tsx
type Badge = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  message: string;
  totalPoints: number | null;
  level: number | null;
  badges: Badge[];
};

export default function RewardPanel({ message, totalPoints, level, badges }: Props) {
  return (
    <div className="rounded-lg border border-[#d9c8a4] bg-[#fffaf0] p-5">
      <p className="font-semibold text-[#193226]">{message}</p>
      {totalPoints !== null ? <p className="mt-2 text-sm">Összes XP: {totalPoints}</p> : null}
      {level !== null ? <p className="mt-1 text-sm">Szint: {level}</p> : null}
      {badges.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {badges.map((badge) => (
            <li key={badge.id} className="rounded-lg border border-[#d9c8a4] bg-white p-3">
              <strong>{badge.name}</strong> - {badge.description}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Create quest player component**

Create `src/components/quest-player.tsx` as a client component using `getQuestQuiz()` and `RewardPanel`. It must:

```tsx
"use client";

import { useState } from "react";
import { getQuestQuiz, isCorrectQuizAnswer } from "@/lib/quest-player";
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
    level: number | null;
    badges: Badge[];
  } | null>(null);

  const currentStep = steps[stepIndex];
  const stepsDone = stepIndex >= steps.length;

  async function completeQuest() {
    if (!isCorrectQuizAnswer(quiz, selectedOptionId)) {
      setQuizMessage(quiz.retryText);
      return;
    }

    setLoading(true);
    setQuizMessage(quiz.successText);

    const response = await fetch(`/api/quests/${slug}/complete`, { method: "POST" });
    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.success) {
      setReward({
        message: data.message ?? "Nem sikerült lezárni a küldetést.",
        totalPoints: null,
        level: null,
        badges: [],
      });
      return;
    }

    setReward({
      message: data.message ?? "Küldetés teljesítve.",
      totalPoints: data.data?.totalPoints ?? data.data?.points ?? null,
      level: data.data?.level ?? null,
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
                onClick={() => setSelectedOptionId(option.id)}
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
          {quizMessage ? <p className="mt-4 text-sm text-[#52645c]">{quizMessage}</p> : null}
          <button
            type="button"
            onClick={completeQuest}
            disabled={loading}
            className="mt-5 rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Küldetés lezárása..." : "Küldetés befejezése"}
          </button>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Use quest player on quest detail page**

Modify `app/quests/[slug]/page.tsx` to import and render:

```tsx
import QuestPlayer from "@/components/quest-player";
```

Replace the static steps and `CompleteQuestButton` section with:

```tsx
<QuestPlayer slug={quest.slug} steps={quest.steps} />
```

Keep the quest description/details above the player.

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm run test:naturequest
corepack pnpm run lint
corepack pnpm run build
```

Expected: tests/lint/build pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src/components/reward-panel.tsx src/components/quest-player.tsx app/quests/[slug]/page.tsx
git commit -m "Add guided quest player"
```

Expected: commit succeeds.

---

### Task 9: Clean Quest Catalog and Completion Copy

**Files:**
- Modify: `app/quests/page.tsx`
- Modify: `app/api/quests/[slug]/complete/route.ts`
- Modify: `src/lib/quest-completion.ts`
- Modify: `src/components/complete-quest-button.tsx` only if still imported anywhere.

- [ ] **Step 1: Clean quest list page**

Modify `app/quests/page.tsx` so it has one header, repaired Hungarian copy, and optional completion state:

```tsx
const session = await auth();
const user = session?.user?.email
  ? await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { questProgress: { where: { status: "COMPLETED" } } },
    })
  : null;
const completedQuestIds = new Set(user?.questProgress.map((item) => item.questId) ?? []);
```

For each quest card, show:

```tsx
{completedQuestIds.has(quest.id) ? (
  <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-sm font-semibold text-[#1b4332]">
    Teljesítve
  </span>
) : null}
```

- [ ] **Step 2: Repair completion API and service messages**

Use these exact Hungarian strings in touched completion files:

```ts
"Bejelentkezés szükséges."
"Ez a küldetés már korábban teljesítve lett."
"A küldetés sikeresen teljesítve."
"Nem sikerült teljesíteni a küldetést."
"A felhasználó nem található."
"A küldetés nem található vagy nem elérhető."
`Teljesített küldetés: ${quest.title}`
```

- [ ] **Step 3: Remove unused old completion component if safe**

Run:

```powershell
Get-ChildItem -Path app,src -Recurse -File | Select-String -Pattern "CompleteQuestButton"
```

If the only remaining references are the component files themselves, delete `src/components/complete-quest-button.tsx` and `src/components/complete-quest-button.ts`. If a page still imports either file, keep the imported component and repair its copy before continuing.

- [ ] **Step 4: Verify**

Run:

```powershell
corepack pnpm run lint
corepack pnpm run build
```

Expected: lint/build pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add -A -- app/quests/page.tsx app/api/quests/[slug]/complete/route.ts src/lib/quest-completion.ts src/components/complete-quest-button.tsx src/components/complete-quest-button.ts
git commit -m "Polish quest catalog and completion copy"
```

Expected: commit succeeds.

---

### Task 10: Final Verification and Manual Smoke Test

**Files:**
- No planned source changes unless verification finds a bug.

- [ ] **Step 1: Run automated checks**

Run:

```powershell
corepack pnpm run test:naturequest
corepack pnpm run lint
corepack pnpm run build
```

Expected: all commands pass.

- [ ] **Step 2: Start local dev server**

Run:

```powershell
corepack pnpm run dev
```

Expected: Next dev server starts and prints a localhost URL.

- [ ] **Step 3: Manual browser flow**

Open the dev URL and verify:

- Guest `/` shows NatureQuest gateway, not default Next page.
- Register route accepts a new email/password/name.
- Login route signs in.
- First dashboard visit redirects to `/onboarding`.
- Onboarding saves a hero and redirects to `/dashboard`.
- Dashboard shows hero name, class, level, XP, and recommended quest.
- Recommended quest opens `/quests/[slug]`.
- Quest player advances through steps.
- Wrong quiz answer shows a learning-message, not a punitive error.
- Correct quiz answer completes the quest and shows reward feedback.
- Returning to dashboard shows updated completed quest count.
- NatureQuest routes render and `test:naturequest` passed.

- [ ] **Step 4: Stop on verification failures**

If any command or manual flow fails, stop execution and write a short follow-up fix plan that names the exact failing file and command output. Do not batch unknown verification fixes into this plan.

Expected: no source changes in this step when verification passes.

---

## Self-Review Notes

- Spec coverage: gateway, onboarding, profile persistence, dashboard, quest catalog cleanup, quest player, reward feedback, auth checks, and verification are each mapped to tasks.
- Scope control: no full Character/World/Inventory model, no GPS, no parent dashboard, no admin editor, and no unrelated project rewrite.
- Type consistency: `characterName`, `characterClass`, `avatarPreset`, and `onboardingCompletedAt` are used consistently across schema, helper, API, page, and dashboard tasks.
- Next.js 16 compatibility: dynamic route `params` stay awaited in existing routes; new routes avoid sync params.
