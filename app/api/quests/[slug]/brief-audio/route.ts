import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const briefAudioSchema = z.object({
  text: z.string().min(20).max(1500),
});

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "A hangos AI briefhez jelentkezz be.",
        },
        { status: 401 }
      );
    }

    await context.params;

    const body = await request.json();
    const parsed = briefAudioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "A hangos briefhez ervenyes szoveg szukseges.",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Az OpenAI kapcsolat most nem erheto el.",
        },
        { status: 503 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "coral",
        input: parsed.data.text,
        instructions:
          "Beszelj magyarul, meleg, nyugodt, gyerekbarat hangnemben, termeszetes ritmussal.",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("POST /api/quests/[slug]/brief-audio openai error:", details);

      return NextResponse.json(
        {
          success: false,
          message: "Nem sikerult letrehozni a hangos AI briefet.",
        },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("POST /api/quests/[slug]/brief-audio error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Nem sikerult letrehozni a hangos AI briefet.",
      },
      { status: 500 }
    );
  }
}
