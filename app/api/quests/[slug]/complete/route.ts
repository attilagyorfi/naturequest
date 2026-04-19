import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { completeQuestBySlug } from "@/lib/quest-completion";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Bejelentkezés szükséges.",
        },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const result = await completeQuestBySlug(slug, session.user.email);

    if (result.alreadyCompleted) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        message: "Ez a küldetés már korábban teljesítve lett.",
        data: {
          questTitle: result.quest.title,
          points: result.user.points,
          totalPoints: result.user.points,
          pointsReward: 0,
          previousLevel: result.previousLevel,
          level: result.user.level,
          leveledUp: result.leveledUp,
          xpUntilNextLevel: result.xpUntilNextLevel,
        },
      });
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: false,
      message: "A küldetés sikeresen teljesítve.",
      data: {
        questTitle: result.quest.title,
        pointsReward: result.quest.pointsReward,
        totalPoints: result.user.points,
        previousLevel: result.previousLevel,
        level: result.user.level,
        leveledUp: result.leveledUp,
        xpUntilNextLevel: result.xpUntilNextLevel,
        badges: result.newlyAwardedBadges,
      },
    });
  } catch (error) {
    console.error("POST /api/quests/[slug]/complete error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Nem sikerült teljesíteni a küldetést.",
      },
      { status: 500 }
    );
  }
}
