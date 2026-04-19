import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuestPlayer from "@/components/quest-player";

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
