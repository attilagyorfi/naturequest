import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "A név túl rövid."),
  email: z.email("Adj meg érvényes email címet."),
  password: z
    .string()
    .min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Hibás adatok.",
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Ezzel az email címmel már létezik felhasználó.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        level: 1,
        points: 0,
        profile: {
          create: {},
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sikeres regisztráció.",
      userId: user.id,
    });
  } catch (error) {
    console.error("POST /api/register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Hiba történt a regisztráció során.",
      },
      { status: 500 }
    );
  }
}
