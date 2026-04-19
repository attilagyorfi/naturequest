import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { selectRecommendedQuest } from "@/lib/dashboard";
import { getCharacterClass, isOnboardingComplete } from "@/lib/onboarding";
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

  const completedQuestIds = new Set(
    user.questProgress.map((item) => item.questId)
  );
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
              {user.questProgress.length}
            </p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Badge-ek</p>
            <p className="mt-2 text-3xl font-bold">{user.userBadges.length}</p>
          </div>
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm text-[#52645c]">Következő cél</p>
            <p className="mt-2 text-3xl font-bold">
              {recommendedQuest ? "+XP" : "Pihenő"}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5f2e]">
            Ajánlott ösvény
          </p>
          {recommendedQuest ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">
                {recommendedQuest.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[#52645c]">
                {recommendedQuest.shortDescription}
              </p>
              <Link
                href={`/quests/${recommendedQuest.slug}`}
                className="mt-5 inline-flex rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
              >
                Folytasd a kalandot
              </Link>
            </>
          ) : (
            <p className="mt-3 text-[#52645c]">
              A Krónikások most készítik a következő ösvényt. Nézz vissza
              hamarosan.
            </p>
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-6">
            <h2 className="text-xl font-bold">Legutóbbi teljesítések</h2>
            {user.questProgress.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {user.questProgress.slice(0, 4).map((progress) => (
                  <li
                    key={progress.id}
                    className="rounded-lg bg-[#fffaf0] px-4 py-3"
                  >
                    <p className="font-semibold">{progress.quest.title}</p>
                    <p className="text-sm text-[#52645c]">
                      {progress.quest.category.name} | +{progress.earnedPoints}{" "}
                      XP
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
            {user.achievements.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {user.achievements.map((achievement) => (
                  <li
                    key={achievement.id}
                    className="rounded-lg bg-[#fffaf0] px-4 py-3"
                  >
                    <p className="font-semibold">{achievement.action}</p>
                    {achievement.note ? (
                      <p className="text-sm text-[#52645c]">
                        {achievement.note}
                      </p>
                    ) : null}
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
