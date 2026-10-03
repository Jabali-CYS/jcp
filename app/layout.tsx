import type { Metadata } from "next";
import { Readex_Pro, Almarai } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { createClient } from "@/lib/supabase/server";

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
      { url: "/academy-logo.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/academy-logo.png?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
  openGraph: {
    title: "JCP Academy | الأكاديمية الحزبية",
    description: "المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني",
    url: "https://jcpacademy.com",
    siteName: "JCP Academy | الأكاديمية الحزبية",
    images: [
      {
        url: "/academy-logo.png?v=2",
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
    images: ["/academy-logo.png?v=2"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser = null;
  let initialIsAdmin = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      initialUser = { id: user.id, email: user.email };
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      initialIsAdmin = roleData?.role === 'admin';
    }
  } catch {
    // Fallback during static prerendering
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readexPro.variable} ${almarai.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/academy-logo.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/academy-logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="preload" href="/party-logo.png" as="image" type="image/png" />
        <link rel="preload" href="/academy-logo.png" as="image" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: "if(typeof window!=='undefined'&&!window.__name){window.__name=function(t){return t};}if(typeof globalThis!=='undefined'&&!globalThis.__name){globalThis.__name=function(t){return t};}",
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-readex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 relative">
        <LanguageProvider>
          <ThemeProvider>
            <InteractiveBackground />
            <Header initialUser={initialUser} initialIsAdmin={initialIsAdmin} />
            <main className="flex-1 relative z-10">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
