import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const primaryHref = session?.user ? "/dashboard" : "/register";
  const secondaryHref = session?.user ? "/quests" : "/login";

  return (
    <main className="min-h-screen bg-[#f6f0e4] text-[#193226]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
          NatureQuest
        </p>
        <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          A tudás itt kalanddá változik.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#42584d]">
          Lépj be Naturaliába, válassz rendet, teljesíts küldetéseket, és
          gyűjts erőt minden új felfedezéssel.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white"
          >
            {session?.user ? "Vissza a kalandhoz" : "Kaland indítása"}
          </Link>
          <Link
            href={secondaryHref}
            className="rounded-lg border border-[#b99555] px-5 py-3 font-semibold text-[#193226]"
          >
            {session?.user ? "Küldetések böngészése" : "Már van fiókom"}
          </Link>
        </div>
      </section>
    </main>
  );
}
