import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          questProgress: {
            where: { status: "COMPLETED" },
          },
        },
      })
    : null;

  const completedQuestIds = new Set(
    user?.questProgress.map((item) => item.questId) ?? []
  );

  const quests = await prisma.quest.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [
      {
        category: {
          name: "asc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      category: true,
      steps: {
        orderBy: {
          stepOrder: "asc",
        },
      },
      audioGuides: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
              Küldetések
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              NatureQuest küldetések
            </h1>

            <p className="mt-3 max-w-2xl text-lg text-[#52645c]">
              Fedezd fel a természet, történelem, irodalom és közgazdaságtan
              világát játékos, valós élményekre épülő küldetéseken keresztül.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex rounded-lg bg-[#1b4332] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#255f46]"
          >
            Dashboard
          </Link>
        </div>

        {quests.length === 0 ? (
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-8">
            <p className="text-lg font-medium">
              Jelenleg még nincs elérhető küldetés.
            </p>

            <p className="mt-2 text-[#52645c]">
              Ellenőrizd, hogy a seed rendben lefutott-e, és vannak-e
              PUBLISHED státuszú questek.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quests.map((quest) => (
              <article
                key={quest.id}
                className="rounded-lg border border-[#d9c8a4] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-sm font-medium text-[#1b4332]">
                    {quest.category.name}
                  </span>

                  {completedQuestIds.has(quest.id) ? (
                    <span className="rounded-full bg-[#fff0c9] px-3 py-1 text-sm font-semibold text-[#7b5f2e]">
                      Teljesítve
                    </span>
                  ) : (
                    <span className="text-sm text-[#52645c]">
                      {quest.estimatedMinutes ?? "?"} perc
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-semibold">{quest.title}</h2>

                <p className="mt-3 text-[#52645c]">{quest.shortDescription}</p>

                <div className="mt-5 space-y-2 text-sm text-[#52645c]">
                  <p>
                    <strong>Pont:</strong> {quest.pointsReward}
                  </p>

                  <p>
                    <strong>Nehézség:</strong> {quest.difficulty}
                  </p>

                  <p>
                    <strong>Lépések száma:</strong> {quest.steps.length}
                  </p>

                  <p>
                    <strong>Hanganyagok:</strong> {quest.audioGuides.length}
                  </p>

                  {quest.locationHint && (
                    <p>
                      <strong>Helyszín tipp:</strong> {quest.locationHint}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    href={`/quests/${quest.slug}`}
                    className="inline-flex rounded-lg bg-[#193226] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#255f46]"
                  >
                    Küldetés megnyitása
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
