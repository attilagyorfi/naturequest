import "dotenv/config";
import { PrismaClient, QuestDifficulty, QuestStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding NatureQuest database...");

  const adminPassword = await bcrypt.hash("Admin123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@naturequest.local" },
    update: {},
    create: {
      email: "admin@naturequest.local",
      name: "NatureQuest Admin",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      points: 0,
      level: 1,
      profile: {
        create: {
          avatarUrl: "/avatars/admin.png",
          favoriteTopic: "Rendszerkezelés",
          prefersAudio: true,
          characterName: "Admin Krónikás",
          characterClass: "chronicler",
          avatarPreset: 3,
          onboardingCompletedAt: new Date(),
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "termeszet" },
      update: {},
      create: {
        name: "Természet",
        slug: "termeszet",
        description: "Fedezd fel az erdők, mezők és parkok világát játékos küldetéseken keresztül.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tortenelem" },
      update: {},
      create: {
        name: "Történelem",
        slug: "tortenelem",
        description: "Utazz vissza az időben, és ismerd meg a múlt érdekességeit izgalmas feladatokkal.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "irodalom" },
      update: {},
      create: {
        name: "Irodalom",
        slug: "irodalom",
        description: "Találkozz történetekkel, szereplőkkel és kreatív szövegalkotási kihívásokkal.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "kozgazdasagtan" },
      update: {},
      create: {
        name: "Közgazdaságtan",
        slug: "kozgazdasagtan",
        description: "Tanuld meg játékosan a pénz, döntések és erőforrások világának alapjait.",
      },
    }),
  ]);

  const [natureCategory, historyCategory, literatureCategory, economicsCategory] = categories;

  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { slug: "elso-lepes" },
      update: {},
      create: {
        name: "Első lépés",
        slug: "elso-lepes",
        description: "Teljesítetted az első küldetésedet.",
        iconUrl: "/badges/elso-lepes.png",
        pointsThreshold: 10,
      },
    }),
    prisma.badge.upsert({
      where: { slug: "felfedezo" },
      update: {},
      create: {
        name: "Felfedező",
        slug: "felfedezo",
        description: "Több különböző témakörben is kipróbáltad magad.",
        iconUrl: "/badges/felfedezo.png",
        pointsThreshold: 50,
      },
    }),
    prisma.badge.upsert({
      where: { slug: "hang-vadasz" },
      update: {},
      create: {
        name: "Hangvadász",
        slug: "hang-vadasz",
        description: "Legalább egy audio guide segítségével teljesítettél küldetést.",
        iconUrl: "/badges/hang-vadasz.png",
        pointsThreshold: 30,
      },
    }),
    prisma.badge.upsert({
      where: { slug: "tudasorzo" },
      update: {},
      create: {
        name: "Tudásőrző",
        slug: "tudasorzo",
        description: "Komoly tanulási kihívást is sikeresen teljesítettél.",
        iconUrl: "/badges/tudasorzo.png",
        pointsThreshold: 100,
      },
    }),
  ]);

  await prisma.quest.upsert({
    where: { slug: "erdei-nyomkereso" },
    update: {},
    create: {
      title: "Erdei nyomkereső",
      slug: "erdei-nyomkereso",
      shortDescription: "Figyeld meg az erdő nyomait, és fedezd fel, milyen jeleket hagy maga után a természet.",
      description:
        "Ebben a küldetésben egy közeli parkban vagy erdős területen kell megfigyelned leveleket, nyomokat, madárhangokat és más természetes jeleket. A cél, hogy megtanulj tudatosan figyelni a környezetedre.",
      locationHint: "Közeli park, liget vagy erdei sétaút",
      estimatedMinutes: 25,
      pointsReward: 20,
      difficulty: QuestDifficulty.EASY,
      status: QuestStatus.PUBLISHED,
      coverImageUrl: "/quests/erdei-nyomkereso.jpg",
      categoryId: natureCategory.id,
      steps: {
        create: [
          {
            title: "Találj egy nyugodt helyet a természetben",
            description: "Keress egy olyan helyet, ahol biztonságosan tudsz nézelődni és megfigyelni a környezetedet.",
            stepOrder: 1,
          },
          {
            title: "Figyelj meg három különböző természeti jelet",
            description: "Lehet ez levélforma, madárhang, fakéreg, lábnyom vagy szélmozgás.",
            stepOrder: 2,
          },
          {
            title: "Jegyezd le vagy mondd fel, mit találtál",
            description: "Készíts rövid jegyzetet vagy hangfelvételt a megfigyeléseidről.",
            stepOrder: 3,
          },
        ],
      },
      audioGuides: {
        create: [
          {
            title: "Bevezető az erdei megfigyeléshez",
            audioUrl: "/audio/erdei-nyomkereso-intro.mp3",
            durationSeconds: 95,
            transcript:
              "Figyelj a hangokra, a formákra és az apró részletekre. A természet mindig kommunikál, csak észre kell venned.",
          },
        ],
      },
    },
  });

  await prisma.quest.upsert({
    where: { slug: "varosi-tortenelmi-seta" },
    update: {},
    create: {
      title: "Városi történelmi séta",
      slug: "varosi-tortenelmi-seta",
      shortDescription: "Fedezd fel, milyen történetek rejtőznek az utcák, épületek és emlékhelyek mögött.",
      description:
        "Ebben a küldetésben a lakóhelyed közelében keresel egy régi épületet, emléktáblát vagy történelmi helyszínt, majd utánanézel, milyen múltbeli esemény kapcsolódik hozzá.",
      locationHint: "Belváros, főtér, emléktábla vagy régi épület közelében",
      estimatedMinutes: 30,
      pointsReward: 25,
      difficulty: QuestDifficulty.MEDIUM,
      status: QuestStatus.PUBLISHED,
      coverImageUrl: "/quests/varosi-tortenelmi-seta.jpg",
      categoryId: historyCategory.id,
      steps: {
        create: [
          {
            title: "Keress egy történelmi helyszínt",
            description: "Fotózz le vagy jegyezz fel egy épületet, emléktáblát vagy szobrot.",
            stepOrder: 1,
          },
          {
            title: "Nézz utána a hely történetének",
            description: "Tudd meg, miért fontos ez a hely, és milyen esemény vagy személy kapcsolódik hozzá.",
            stepOrder: 2,
          },
          {
            title: "Meséld el röviden a történetet",
            description: "Fogalmazd meg 3–5 mondatban, mit tanultál.",
            stepOrder: 3,
          },
        ],
      },
      audioGuides: {
        create: [
          {
            title: "Hogyan figyelj egy városi emlékhelyre?",
            audioUrl: "/audio/varosi-tortenelmi-seta-guide.mp3",
            durationSeconds: 120,
            transcript:
              "Nézd meg az épület részleteit, a dátumokat és az emléktáblákat. Ezek gyakran többet árulnak el, mint elsőre gondolnád.",
          },
        ],
      },
    },
  });

  await prisma.quest.upsert({
    where: { slug: "mese-es-helyszin" },
    update: {},
    create: {
      title: "Mese és helyszín",
      slug: "mese-es-helyszin",
      shortDescription: "Olvass el egy rövid történetet, majd kapcsolj hozzá valós helyszínt vagy hangulatot.",
      description:
        "Ebben a küldetésben egy rövid irodalmi részlet vagy mese alapján kell elképzelned, hogy milyen valós helyszínen játszódhatna a történet, majd ezt a helyet meg is keresheted a környezetedben.",
      locationHint: "Park, könyvtár, iskolaudvar vagy csendes kültéri helyszín",
      estimatedMinutes: 20,
      pointsReward: 15,
      difficulty: QuestDifficulty.EASY,
      status: QuestStatus.PUBLISHED,
      coverImageUrl: "/quests/mese-es-helyszin.jpg",
      categoryId: literatureCategory.id,
      steps: {
        create: [
          {
            title: "Olvass el egy rövid történetet vagy részletet",
            description: "Lehet mese, novella vagy egy rövid leírás.",
            stepOrder: 1,
          },
          {
            title: "Keress hozzá illő helyszínt",
            description: "Gondold végig, hol játszódhatna a történet a valóságban.",
            stepOrder: 2,
          },
          {
            title: "Írj vagy mondj fel egy rövid leírást",
            description: "Mutasd be, miért ezt a helyszínt választottad.",
            stepOrder: 3,
          },
        ],
      },
      audioGuides: {
        create: [
          {
            title: "Képzelet és megfigyelés",
            audioUrl: "/audio/mese-es-helyszin-guide.mp3",
            durationSeconds: 85,
            transcript:
              "Használd a fantáziád, de figyelj a valós részletekre is. Ettől lesz élő a történet és hiteles a helyszín.",
          },
        ],
      },
    },
  });

  await prisma.quest.upsert({
    where: { slug: "mini-piac-kaland" },
    update: {},
    create: {
      title: "Mini piac kaland",
      slug: "mini-piac-kaland",
      shortDescription: "Tanuld meg, hogyan működik a csere, az ár és a döntés egyszerű példákon keresztül.",
      description:
        "Ebben a küldetésben egy bolt, piac vagy képzeletbeli vásárlási helyzet segítségével vizsgálod meg, hogy mi alapján választunk termékeket, hogyan gondolkodunk az árakról és miért fontos a döntés.",
      locationHint: "Bolt, piac vagy otthoni szerepjátékos környezet",
      estimatedMinutes: 25,
      pointsReward: 20,
      difficulty: QuestDifficulty.MEDIUM,
      status: QuestStatus.PUBLISHED,
      coverImageUrl: "/quests/mini-piac-kaland.jpg",
      categoryId: economicsCategory.id,
      steps: {
        create: [
          {
            title: "Válassz ki három terméket",
            description: "Figyeld meg, melyik mennyibe kerül, és mire való.",
            stepOrder: 1,
          },
          {
            title: "Hasonlítsd össze őket",
            description: "Gondold végig, ár, minőség vagy szükséglet alapján melyiket választanád.",
            stepOrder: 2,
          },
          {
            title: "Indokold meg a döntésedet",
            description: "Írd le vagy mondd fel, miért azt választottad, amit.",
            stepOrder: 3,
          },
        ],
      },
      audioGuides: {
        create: [
          {
            title: "Hogyan döntünk vásárláskor?",
            audioUrl: "/audio/mini-piac-kaland-guide.mp3",
            durationSeconds: 110,
            transcript:
              "Nem mindig a legolcsóbb a legjobb választás. A döntést befolyásolja a szükséglet, az érték és az elérhető lehetőségek is.",
          },
        ],
      },
    },
  });

  await prisma.achievementLog.create({
    data: {
      userId: adminUser.id,
      action: "SEED_DATABASE",
      pointsDelta: 0,
      note: "Kezdeti rendszerfeltöltés kategóriákkal, badge-ekkel és küldetésekkel.",
    },
  });

  console.log("Seed completed successfully.");
  console.log(`Admin user created: ${adminUser.email}`);
  console.log(`Categories created: ${categories.length}`);
  console.log(`Badges created: ${badges.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
