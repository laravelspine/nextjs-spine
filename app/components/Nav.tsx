"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      {loading ? null : user ? (
        <>
          <span className="text-zinc-400">
            Halo, <span className="font-medium text-zinc-200">{user.name}</span>
          </span>
          <button
            onClick={onLogout}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            Keluar
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-emerald-400 transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-emerald-500 px-3 py-1.5 font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
