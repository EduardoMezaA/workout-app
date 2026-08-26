import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("USER:", user?.id, user?.email);

  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-8 py-4 flex gap-6">
        <span className="font-bold text-blue-400">Admin</span>
        <a
          href="/admin/muscle-groups"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Grupos musculares
        </a>
        <a
          href="/admin/exercises"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Ejercicios
        </a>
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors ml-auto"
        >
          ← App
        </a>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  );
}
