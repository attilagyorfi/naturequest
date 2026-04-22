import { existsSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import QuestPlayer from "@/components/quest-player";
import { formatDurationLabel } from "@/lib/quest-detail";
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

  const audioGuides = quest.audioGuides.map((guide) => ({
    ...guide,
    hasAudioFile: existsSync(
      path.join(process.cwd(), "public", guide.audioUrl.replace(/^\/+/, ""))
    ),
  }));

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="rounded-full bg-[#e5f1e8] px-3 py-1 text-sm font-medium text-[#1b4332]">
            {quest.category.name}
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {quest.title}
          </h1>

          <p className="mt-4 text-lg text-[#52645c]">
            {quest.shortDescription}
          </p>
        </div>

        <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <h2 className="text-2xl font-semibold">Küldetés leírása</h2>

          <p className="mt-4 whitespace-pre-line text-[#52645c]">
            {quest.description}
          </p>
        </section>

        <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <h2 className="text-2xl font-semibold">Részletek</h2>

          <div className="mt-4 grid gap-3 text-[#52645c] sm:grid-cols-2">
            <p>
              <strong>Pontjutalom:</strong> {quest.pointsReward}
            </p>

            <p>
              <strong>Nehézség:</strong> {quest.difficulty}
            </p>

            <p>
              <strong>Becsült idő:</strong> {quest.estimatedMinutes ?? "?"} perc
            </p>

            <p>
              <strong>Helyszín tipp:</strong>{" "}
              {quest.locationHint ?? "Nincs megadva"}
            </p>
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
