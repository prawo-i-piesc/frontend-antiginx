import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./i18n/I18nProvider";
import { getLocale, getMessages } from "./i18n/server";
import { MotionProvider } from "./providers/MotionProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";
import SkipLink from "./components/ui/SkipLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const THEME_BOOTSTRAP =
  "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.className=t}catch(e){}";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();

  return {
    title: {
      default: t.meta.defaultTitle,
      template: t.meta.titleTemplate,
    },
    description: t.meta.description,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        {/* Applies a saved light theme before the first paint, instead of
            flashing the dark one until ThemeProvider's effect runs. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* Remix Icon stylesheet (CDN) - enables classes like ri-*/}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider locale={locale}>
          <SkipLink />
          <MotionProvider>
            <ThemeProvider>
              <ToastProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
