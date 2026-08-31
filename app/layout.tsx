import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth-context";
import Nav from "./components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spine — Laravel Core Package",
  description: "Landing page dan contoh aplikasi untuk spine/laravel-spine.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <AuthProvider>
          <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg tracking-tight">
                Spine<span className="text-emerald-400">.</span>
              </Link>
              <Nav />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
          <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
            Spine — example app (Next.js) consuming spine/laravel-spine API
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
