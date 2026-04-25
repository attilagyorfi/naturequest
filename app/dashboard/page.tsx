import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignOutButton from "@/components/sign-out-button";
import { formatAchievementEntry } from "@/lib/chronicle";
import {
  describeRecommendedQuestReason,
  selectRecommendedQuest,
} from "@/lib/dashboard";
import { getCharacterClass, isOnboardingComplete } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { calculateAdventureProgress } from "@/lib/progress";
import { resolveLocalAssetPath } from "@/lib/quest-detail";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const [user, quests] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        userBadges: {
          include: { badge: true },
          orderBy: { awardedAt: "desc" },
        },
        questProgress: {
          where: { status: "COMPLETED" },
          include: {
            quest: {
              include: { category: true },
            },
          },
          orderBy: { completedAt: "desc" },
        },
        achievements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.quest.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, audioGuides: true },
      orderBy: [{ createdAt: "asc" }],
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  if (!isOnboardingComplete(user.profile)) {
    redirect("/onboarding");
  }

  const completedQuestIds = new Set(
    user.questProgress.map((item) => item.questId)
  );
  const recommendedQuest = selectRecommendedQuest(
    quests,
    completedQuestIds,
    user.questProgress
  );
  const recommendedQuestReason = describeRecommendedQuestReason(
    recommendedQuest,
    user.questProgress
  );
  const characterClass = getCharacterClass(user.profile?.characterClass);
  const progress = calculateAdventureProgress({
    totalQuests: quests.length,
    completedQuests: completedQuestIds.size,
    points: user.points,
    level: user.level,
  });
  const chronicleEntries = user.achievements.map((achievement) => ({
    id: achievement.id,
    createdAt: achievement.createdAt,
    ...formatAchievementEntry(achievement),
  }));
  const questAssetDirectory = path.join(process.cwd(), "public", "quests");
  const questAssets = existsSync(questAssetDirectory)
    ? new Set(
        readdirSync(questAssetDirectory).map((fileName) => `/quests/${fileName}`)
      )
    : new Set<string>();
  const recommendedQuestCover = recommendedQuest
    ? resolveLocalAssetPath(
        recommendedQuest.coverImageUrl ?? `/quests/${recommendedQuest.slug}.png`,
        questAssets
      )
    : null;

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
              {characterClass?.label ?? "Hős"} | {user.level}. szint |{" "}
              {user.points} XP
            </p>
          </div>
          <SignOutButton />
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Teljesített küldetések</p>
            <p className="mt-2 text-3xl font-bold">
              {progress.completedQuests}/{progress.totalQuests}
            </p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Badge-ek</p>
            <p className="mt-2 text-3xl font-bold">{user.userBadges.length}</p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Következő szintig</p>
            <p className="mt-2 text-3xl font-bold">
              {progress.xpUntilNextLevel} XP
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
                Kaland előrehaladás
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {progress.completionPercent}% bejárva
              </h2>
            </div>
            <p className="text-sm text-[#52645c]">
              {progress.remainingQuests} küldetés vár még rád
            </p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded bg-[#eadfca]">
            <div
              className="h-full rounded bg-[#1b4332]"
              style={{ width: `${progress.completionPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-[#52645c]">
            Következő szint célja: {progress.nextLevelTarget} XP.
          </p>
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-[#d9c8a4] bg-white">
          {recommendedQuest && recommendedQuestCover ? (
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-[280px] bg-[#d7e7d7]">
                <Image
                  src={recommendedQuestCover}
                  alt={`${recommendedQuest.title} ajánlott küldetés borítóképe`}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#193226]/70 via-[#193226]/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f6f0e4]">
                    Mai kaland
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-white">
                    {recommendedQuest.title}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
                  Ajánlott ösvény
                </p>
                <p className="mt-3 text-lg text-[#52645c]">
                  {recommendedQuest.shortDescription}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#1b4332]">
                  {recommendedQuestReason}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#fffaf0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b5f2e]">
                      Jutalom
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      +{recommendedQuest.pointsReward} XP
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fffaf0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b5f2e]">
                      Becsült idő
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {recommendedQuest.estimatedMinutes ?? "?"} perc
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fffaf0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b5f2e]">
                      Témakör
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {recommendedQuest.category.name}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#fffaf0] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b5f2e]">
                      Hanganyag
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {recommendedQuest.audioGuides.length} db
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/quests/${recommendedQuest.slug}`}
                    className="inline-flex rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
                  >
                    Kaland indítása
                  </Link>
                  <Link
                    href="/quests"
                    className="inline-flex rounded-lg border border-[#d9c8a4] bg-white px-5 py-3 font-semibold text-[#193226]"
                  >
                    Összes küldetés
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
                Ajánlott ösvény
              </p>
              <p className="mt-3 text-[#52645c]">
                A Krónikások most készítik a következő ösvényt. Nézz vissza
                hamarosan.
              </p>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-6">
            <h2 className="text-xl font-bold">Legutóbbi teljesítések</h2>
            {user.questProgress.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {user.questProgress.slice(0, 4).map((progressItem) => (
                  <li
                    key={progressItem.id}
                    className="rounded-lg bg-[#fffaf0] px-4 py-3"
                  >
                    <p className="font-semibold">{progressItem.quest.title}</p>
                    <p className="text-sm text-[#52645c]">
                      {progressItem.quest.category.name} | +
                      {progressItem.earnedPoints} XP
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[#52645c]">
                Az első küldetés után itt jelennek meg a hőstetteid.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-6">
            <h2 className="text-xl font-bold">Friss krónika</h2>
            {chronicleEntries.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {chronicleEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg bg-[#fffaf0] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="font-semibold">{entry.title}</p>
                      {entry.pointsLabel ? (
                        <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-xs font-semibold text-[#1b4332]">
                          {entry.pointsLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[#52645c]">
                      {entry.detail}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[#52645c]">
                A krónika az első kalandod után kezd íródni.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
