import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Regisztráció</h1>
          <p className="mt-3 text-gray-600">
            Hozz létre új NatureQuest fiókot.
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
