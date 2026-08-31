import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Sidebar from "./components/Sidebar";
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
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
