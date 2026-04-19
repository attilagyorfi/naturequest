import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOnboardingComplete } from "@/lib/onboarding";
import OnboardingForm from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    redirect("/login");
  }

  if (isOnboardingComplete(user.profile)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f6f0e4] px-6 py-10 text-[#193226]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5f2e]">
            Naturalia kapuja
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Mielőtt belépsz, válaszd ki, milyen hősként tanulsz.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#42584d]">
            A tudás itt nem lecke, hanem erő. Az első rend csak az indulás:
            minden jó válasz új ösvényt nyit.
          </p>
        </section>

        <OnboardingForm defaultName={user.name ?? ""} />
      </div>
    </main>
  );
}
