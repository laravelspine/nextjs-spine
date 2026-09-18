import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n-context";
import { ThemeProvider } from "./components/ThemeProvider";
import ModuleHost from "./module-host";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./globals.css";
import { Inter, Noto_Sans_JP, Noto_Sans_KR } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "Spine — Laravel Core Package",
  description: "Landing page dan contoh aplikasi untuk spine/laravel-spine.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // ponytail: force-dynamic — tanpa ini Next.js me-prerender layout ke cache
  // ISR (x-nextjs-stale-time: 300), jadi setelah deploy browser dapat HTML
  // lama (form lama, hydration #418) sampai cache kedaluwarsa 5 menit.
  // Biaya: tanpa static generation — sesuai untuk app yang 100% API-driven.
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${notoSansJP.variable} ${notoSansKR.variable}`}>
      <body className="min-h-screen bg-surface text-ink antialiased font-sans">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <ModuleHost />
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Topbar />
                  <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
                </div>
              </div>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
