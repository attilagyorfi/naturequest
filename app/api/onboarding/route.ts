import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/onboarding";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Bejelentkezés szükséges." },
      { status: 401 }
    );
  }

  const parsed = onboardingSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Hibás karakteradatok.",
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "A felhasználó nem található." },
      { status: 404 }
    );
  }

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
    create: {
      userId: user.id,
      ...parsed.data,
      onboardingCompletedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    message: "A hősöd készen áll.",
  });
}
