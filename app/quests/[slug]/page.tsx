import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { notFound } from "next/navigation";
import AiFieldBrief from "@/components/ai-field-brief";
import QuestPlayer from "@/components/quest-player";
import {
  formatDurationLabel,
  resolveLocalAssetPath,
} from "@/lib/quest-detail";
import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsSearchUrl,
  buildQuestMapQuery,
} from "@/lib/maps";
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

  const mapQuery = buildQuestMapQuery(quest.title, quest.locationHint);
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(
    mapQuery,
    process.env.GOOGLE_MAPS_API_KEY
  );
  const mapsSearchUrl = buildGoogleMapsSearchUrl(mapQuery);

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 overflow-hidden rounded-lg border border-[#d9c8a4] bg-white">
          <div className="relative min-h-[280px] bg-[#d7e7d7] sm:min-h-[360px]">
            <Image
              src={coverImageUrl}
              alt={`${quest.title} kuldetes boritokepe`}
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
            <p className="text-sm font-semibold text-[#7b5f2e]">Nehezseg</p>
            <p className="mt-2 text-2xl font-bold">{quest.difficulty}</p>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Becsult ido</p>
            <p className="mt-2 text-2xl font-bold">
              {quest.estimatedMinutes ?? "?"} perc
            </p>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-white p-5">
            <p className="text-sm font-semibold text-[#7b5f2e]">Lepesek</p>
            <p className="mt-2 text-2xl font-bold">{quest.steps.length}</p>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-white p-6">
          <h2 className="text-2xl font-semibold">Kuldetes leirasa</h2>

          <p className="mt-4 whitespace-pre-line text-[#52645c]">
            {quest.description}
          </p>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-[#d9c8a4] bg-white p-6">
            <h2 className="text-2xl font-semibold">Mire figyelj indulas elott?</h2>

            <ul className="mt-4 space-y-3 text-[#52645c]">
              <li>
                Szanj ra nyugodtan ennyi idot: {quest.estimatedMinutes ?? "?"}{" "}
                perc.
              </li>
              <li>
                A helyszin tipp segit a rahangolodasban:{" "}
                {quest.locationHint ?? "nincs kulon megadva"}.
              </li>
              <li>
                Hallgasd meg az utmutatot, es csak utana indulj neki a
                lepeseknek.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#d9c8a4] bg-[#fcf8ef] p-6">
            <h2 className="text-2xl font-semibold">Mit vigyel magaddal?</h2>

            <ul className="mt-4 space-y-3 text-[#52645c]">
              <li>Nyitott figyelmet es egy kis kivancsisagot.</li>
              <li>Telefont vagy jegyzetelesi lehetoseget a megfigyelesekhez.</li>
              <li>Kenyelmes tempot, mert itt nem a sietseg szamit.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-lg border border-[#d9c8a4] bg-white">
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7b5f2e]">
                Helyszin
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Google Maps nezet</h2>
              <p className="mt-3 text-[#52645c]">
                Nezd meg a kuldeteshez illo helyszint, es nyisd meg kulon
                terkepen, ha ott szeretnel indulni.
              </p>
            </div>

            {mapEmbedUrl ? (
              <iframe
                title={`${quest.title} Google Maps helyszin`}
                src={mapEmbedUrl}
                className="h-[320px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="px-6 pb-6 text-sm text-[#52645c]">
                A terkep most nem erheto el, de a helyszintipp mar segit az
                indulashoz.
              </div>
            )}

            <div className="p-6 pt-4">
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-[#1b4332] px-4 py-3 font-semibold text-white"
              >
                Megnyitas Google Mapsben
              </a>
            </div>
          </div>

          <AiFieldBrief
            slug={quest.slug}
          />
        </section>

        {audioGuides.length > 0 ? (
          <section className="mb-8 rounded-lg border border-[#d9c8a4] bg-[#fcf8ef] p-6">
            <h2 className="text-2xl font-semibold">Felkeszules</h2>

            <p className="mt-3 text-[#52645c]">
              Indulas elott erdemes atfutni a rovid utmutatot, hogy
              konnyebben rahangolodj a kuldetesre.
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
                      A bongeszod nem tamogatja a hanganyag lejatszasat.
                    </audio>
                  ) : (
                    <p className="mt-4 text-sm text-[#7b5f2e]">
                      A hanganyag rovidesen elerheto lesz, addig az atiratbol
                      tudsz keszulni.
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
