"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-4 py-1.5 rounded-lg border border-gray-700 hover:border-red-500 hover:text-red-400 text-gray-400 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
