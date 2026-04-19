import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/components/sign-out-button";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          NatureQuest
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/quests" className="transition hover:text-black">
            Küldetések
          </Link>

          <Link href="/dashboard" className="transition hover:text-black">
            Dashboard
          </Link>

          {!session?.user ? (
            <>
              <Link href="/login" className="transition hover:text-black">
                Belépés
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
              >
                Regisztráció
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {session.user.name ?? "Felhasználó"}
                </div>
                <div className="text-xs text-gray-500">
                  {session.user.email}
                </div>
              </div>

              <SignOutButton />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
