import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProgressDashboard from "./ProgressDashboard";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Volver
          </Link>
          <span className="font-bold text-lg">Progreso</span>
        </div>
        <span className="text-gray-500 text-sm">{user.email}</span>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <ProgressDashboard />
      </main>
    </div>
  );
}
