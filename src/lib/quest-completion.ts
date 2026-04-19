import { prisma } from "@/lib/prisma";
import { calculateLevelFromPoints, getXpUntilNextLevel } from "@/lib/progress";

export async function completeQuestBySlug(slug: string, userEmail: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });

  if (!user) {
    throw new Error("A felhasználó nem található.");
  }

  const quest = await prisma.quest.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
    },
  });

  if (!quest || quest.status !== "PUBLISHED") {
    throw new Error("A küldetés nem található vagy nem elérhető.");
  }

  const existingProgress = await prisma.userQuestProgress.findUnique({
    where: {
      userId_questId: {
        userId: user.id,
        questId: quest.id,
      },
    },
  });

  if (existingProgress?.status === "COMPLETED") {
    return {
      alreadyCompleted: true,
      quest,
      user,
      previousLevel: user.level,
      leveledUp: false,
      xpUntilNextLevel: getXpUntilNextLevel({
        points: user.points,
        level: user.level,
      }),
      newlyAwardedBadges: [],
    };
  }

  return prisma.$transaction(async (tx) => {
    const previousLevel = user.level;

    await tx.userQuestProgress.upsert({
      where: {
        userId_questId: {
          userId: user.id,
          questId: quest.id,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        earnedPoints: quest.pointsReward,
      },
      create: {
        userId: user.id,
        questId: quest.id,
        status: "COMPLETED",
        completedAt: new Date(),
        earnedPoints: quest.pointsReward,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        points: {
          increment: quest.pointsReward,
        },
      },
    });

    const calculatedLevel = calculateLevelFromPoints(updatedUser.points);

    const leveledUser = await tx.user.update({
      where: { id: user.id },
      data: {
        level: calculatedLevel,
      },
    });

    await tx.achievementLog.create({
      data: {
        userId: user.id,
        action: "QUEST_COMPLETED",
        pointsDelta: quest.pointsReward,
        note: `Teljesített küldetés: ${quest.title}`,
      },
    });

    const availableBadges = await tx.badge.findMany({
      where: {
        pointsThreshold: {
          not: null,
        },
      },
    });

    const alreadyOwnedBadgeIds = new Set(
      (
        await tx.userBadge.findMany({
          where: { userId: user.id },
        })
      ).map((item) => item.badgeId)
    );

    const newlyAwardedBadges = [];

    for (const badge of availableBadges) {
      if (
        badge.pointsThreshold !== null &&
        leveledUser.points >= badge.pointsThreshold &&
        !alreadyOwnedBadgeIds.has(badge.id)
      ) {
        const awarded = await tx.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
          },
          include: {
            badge: true,
          },
        });

        newlyAwardedBadges.push(awarded.badge);
      }
    }

    return {
      alreadyCompleted: false,
      quest,
      user: leveledUser,
      previousLevel,
      leveledUp: calculatedLevel > previousLevel,
      xpUntilNextLevel: getXpUntilNextLevel({
        points: leveledUser.points,
        level: leveledUser.level,
      }),
      newlyAwardedBadges,
    };
  });
}
