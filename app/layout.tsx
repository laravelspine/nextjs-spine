import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "./components/ThemeProvider";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spine — Laravel Core Package",
  description: "Landing page dan contoh aplikasi untuk spine/laravel-spine.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />
                <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
