import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { notFound } from "next/navigation";
import QuestPlayer from "@/components/quest-player";
import {
  formatDurationLabel,
  resolveLocalAssetPath,
} from "@/lib/quest-detail";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function QuestDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const quest = await prisma.quest.findUnique({
    where: {
      slug,
    },
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

  if (!quest || quest.status !== "PUBLISHED") {
    notFound();
  }

  const questAssetDirectory = path.join(process.cwd(), "public", "quests");
  const questAssets = existsSync(questAssetDirectory)
    ? new Set(
        readdirSync(questAssetDirectory).map((fileName) => `/quests/${fileName}`)
      )
    : new Set<string>();

  const coverImageUrl = resolveLocalAssetPath(
    quest.coverImageUrl ?? `/quests/${quest.slug}.png`,
    questAssets
  );

  const audioGuides = quest.audioGuides.map((guide) => ({
    ...guide,
    hasAudioFile: existsSync(
      path.join(process.cwd(), "public", guide.audioUrl.replace(/^\/+/, ""))
    ),
  }));

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 overflow-hidden rounded-lg border border-[#d9c8a4] bg-white">
          <div className="relative min-h-[280px] bg-[#d7e7d7] sm:min-h-[360px]">
            <Image
              src={coverImageUrl}
              alt={`${quest.title} küldetés borítóképe`}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#193226]/80 via-[#193226]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-sm font-medium text-[#1b4332]">
                {quest.category.name}
              </span>

              <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {quest.title}
              </h1>

              <p className="mt-4 max-w-2xl text-base text-[#f6f0e4] sm:text-lg">
                {quest.shortDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Pontjutalom</p>
            <p className="mt-2 text-2xl font-bold">{quest.pointsReward} XP</p>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Nehézség</p>
            <p className="mt-2 text-2xl font-bold">{quest.difficulty}</p>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Becsült idő</p>
            <p className="mt-2 text-2xl font-bold">
              {quest.estimatedMinutes ?? "?"} perc
            </p>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Lépések</p>
            <p className="mt-2 text-2xl font-bold">{quest.steps.length}</p>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <h2 className="text-2xl font-semibold">Küldetés leírása</h2>

          <p className="mt-4 whitespace-pre-line text-[#52645c]">
            {quest.description}
          </p>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-6">
            <h2 className="text-2xl font-semibold">Mire figyelj indulás előtt?</h2>

            <ul className="mt-4 space-y-3 text-[#52645c]">
              <li>Szánj rá nyugodtan ennyi időt: {quest.estimatedMinutes ?? "?"} perc.</li>
              <li>
                A helyszín tipp segít a ráhangolódásban:{" "}
                {quest.locationHint ?? "nincs külön megadva"}.
              </li>
              <li>
                Hallgasd meg az útmutatót, és csak utána indulj neki a
                lépéseknek.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-[#fcf8ef] p-6">
            <h2 className="text-2xl font-semibold">Mit vigyél magaddal?</h2>

            <ul className="mt-4 space-y-3 text-[#52645c]">
              <li>Nyitott figyelmet és egy kis kíváncsiságot.</li>
              <li>Telefont vagy jegyzetelési lehetőséget a megfigyelésekhez.</li>
              <li>Kényelmes tempót, mert itt nem a sietség számít.</li>
            </ul>
          </div>
        </section>

        {audioGuides.length > 0 ? (
          <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-[#fcf8ef] p-6">
            <h2 className="text-2xl font-semibold">Felkészülés</h2>

            <p className="mt-3 text-[#52645c]">
              Indulás előtt érdemes átfutni a rövid útmutatót, hogy könnyebben
              ráhangolódj a küldetésre.
            </p>

            <div className="mt-5 grid gap-4">
              {audioGuides.map((guide) => (
                <article
                  key={guide.id}
                  className="rounded-lg border border-[#d9c8a4] bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#193226]">
                      {guide.title}
                    </h3>

                    <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-sm font-medium text-[#1b4332]">
                      {guide.durationSeconds === null
                        ? "Rovid utmutato"
                        : formatDurationLabel(guide.durationSeconds)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-[#52645c]">
                    {guide.transcript}
                  </p>

                  {guide.hasAudioFile ? (
                    <audio
                      controls
                      preload="none"
                      className="mt-4 w-full"
                      src={guide.audioUrl}
                    >
                      A böngésződ nem támogatja a hanganyag lejátszását.
                    </audio>
                  ) : (
                    <p className="mt-4 text-sm text-[#7b5f2e]">
                      A hanganyag rövidesen elérhető lesz, addig az átiratból
                      tudsz készülni.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <QuestPlayer
          slug={quest.slug}
          steps={quest.steps.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            stepOrder: step.stepOrder,
          }))}
        />
      </div>
    </main>
  );
}
