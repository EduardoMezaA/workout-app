import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">💪 WorkoutApp</span>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/log"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Bitácora
          </Link>
          <Link
            href="/progress"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Progreso
          </Link>
          <span className="text-gray-500 text-sm">{user.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">¡Listo para entrenar?</h1>
        <p className="text-gray-400 mb-10">
          Elige qué trabajar hoy y te generamos tu rutina.
        </p>

        <Link
          href="/dashboard/routine/builder"
          className="block w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-colors text-center font-semibold text-lg"
        >
          Nueva rutina
        </Link>
      </main>
    </div>
  );
}
