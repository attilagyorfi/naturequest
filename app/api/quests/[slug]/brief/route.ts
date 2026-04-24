import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractResponseText(payload: OpenAIResponse) {
  if (payload.output_text) {
    return payload.output_text.trim();
  }

  const textParts =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" && content.text)
      .map((content) => content.text?.trim() ?? "") ?? [];

  return textParts.join("\n").trim();
}

function buildFallbackBrief(quest: {
  title: string;
  locationHint: string | null;
  estimatedMinutes: number | null;
  category: { name: string };
}) {
  return [
    `${quest.title} kuldeteshez indulj nyugodt tempoval, es hagyj idot a megfigyelesre.`,
    `A legjobb kiindulopont: ${quest.locationHint ?? "egy hozzad kozeli, biztonsagos helyszin"}.`,
    `Szamolj nagyjabol ${quest.estimatedMinutes ?? "nehany"} perccel, es figyelj az apro reszletekre is.`,
    `${quest.category.name} temakorben most az a fontos, hogy ne csak nezz, hanem eszre is vegyel.`,
  ].join(" ");
}

export async function POST(_: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Az AI briefhez jelentkezz be.",
        },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
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
      return NextResponse.json(
        {
          success: false,
          message: "A kuldetes nem talalhato.",
        },
        { status: 404 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: true,
          data: {
            brief: buildFallbackBrief(quest),
            source: "fallback",
          },
        },
        { status: 200 }
      );
    }

    const prompt = [
      `Kuldetes neve: ${quest.title}`,
      `Temakor: ${quest.category.name}`,
      `Rovid leiras: ${quest.shortDescription}`,
      `Helyszin tipp: ${quest.locationHint ?? "nincs kulon megadva"}`,
      `Becsult ido: ${quest.estimatedMinutes ?? "ismeretlen"} perc`,
      `Lepesek: ${quest.steps.map((step) => step.title).join("; ")}`,
      `Audio guide cimek: ${quest.audioGuides.map((guide) => guide.title).join("; ") || "nincs"}`,
    ].join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions:
          "Te a NatureQuest terepvezetoje vagy. Irj magyarul egy rovid, baratsagos, gyerekbarat terepbriefet 3-4 mondatban. Legyen konkret, batorito, es segitsen, mire figyeljen a jatekos indulaskor. Ne hasznalj listat, ne irj cimet, ne talalj ki veszelyes tanacsot.",
        input: prompt,
        text: {
          format: {
            type: "text",
          },
        },
      }),
    });

    if (!response.ok) {
      const fallbackBrief = buildFallbackBrief(quest);

      return NextResponse.json(
        {
          success: true,
          data: {
            brief: fallbackBrief,
            source: "fallback",
          },
        },
        { status: 200 }
      );
    }

    const payload = (await response.json()) as OpenAIResponse;
    const brief = extractResponseText(payload) || buildFallbackBrief(quest);

    return NextResponse.json(
      {
        success: true,
        data: {
          brief,
          source: payload.output_text ? "openai" : "fallback",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/quests/[slug]/brief error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Nem sikerult letrehozni az AI briefet.",
      },
      { status: 500 }
    );
  }
}
