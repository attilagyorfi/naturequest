import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json(
      {
        success: true,
        count: quests.length,
        data: quests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/quests error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Nem sikerült lekérni a küldetéseket.",
      },
      { status: 500 }
    );
  }
}