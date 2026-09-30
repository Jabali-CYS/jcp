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
  metadataBase: new URL("https://jcpacademy.com"),
  title: "JCP Academy | الأكاديمية الحزبية",
  description: "المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/academy-logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "JCP Academy | الأكاديمية الحزبية",
    description: "المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني",
    url: "https://jcpacademy.com",
    siteName: "JCP Academy | الأكاديمية الحزبية",
    images: [
      {
        url: "/academy-logo.png",
        width: 800,
        height: 800,
        alt: "شعار الأكاديمية الحزبية",
      },
    ],
    locale: "ar_JO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JCP Academy | الأكاديمية الحزبية",
    description: "المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني",
    images: ["/academy-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readexPro.variable} ${almarai.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "if(typeof window!=='undefined'&&!window.__name){window.__name=function(t){return t};}if(typeof globalThis!=='undefined'&&!globalThis.__name){globalThis.__name=function(t){return t};}",
          }}
        />
      </head>
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
