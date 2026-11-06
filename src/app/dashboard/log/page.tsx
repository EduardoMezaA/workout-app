import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WorkoutLogClient from "./WorkoutLogClient";

export default async function WorkoutLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawRoutines, error } = await supabase
    .from("routines")
    .select(
      `
      id,
      created_at,
      completed_at,
      duration_seconds,
      routine_exercises (
        id,
        sets_done,
        reps_done,
        weight_used,
        exercise:exercises (
          name,
          muscle_group:muscle_groups (
            name,
            slug
          )
        )
      )
    `
    )
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching routines:", error);
  }

  const routines = (rawRoutines as any[]) || [];

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
          <span className="font-bold text-lg">Bitácora de Entrenamientos</span>
        </div>
        <span className="text-gray-500 text-sm">{user.email}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <WorkoutLogClient routines={routines} />
      </main>
    </div>
  );
}
