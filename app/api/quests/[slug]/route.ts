import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
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
          message: "A küldetés nem található.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: quest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/quests/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Nem sikerült lekérni a küldetés részleteit.",
      },
      { status: 500 }
    );
  }
}