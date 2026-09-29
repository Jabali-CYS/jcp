import type { Metadata } from "next";
import { Readex_Pro, Almarai } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

export const metadata: Metadata = {
  title: "JCP Academy | الأكاديمية الحزبية",
  description: "المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readexPro.variable} ${almarai.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-readex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
