import type { Metadata } from "next";
import { Geist_Mono, Google_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./i18n/I18nProvider";
import { getLocale, getMessages } from "./i18n/server";
import { MotionProvider } from "./providers/MotionProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";
import SkipLink from "./components/ui/SkipLink";
import { siteOrigin } from "./lib/siteOrigin";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Also copies the sidebar choice onto <html>, so the loading skeleton draws
// the sidebar at its real width from the first frame (see useSidebarPreference).
const THEME_BOOTSTRAP =
  "try{var d=document.documentElement,t=localStorage.getItem('theme'),s=localStorage.getItem('sidebar.collapsed');if(t==='light'||t==='dark')d.className=t;if(s==='1'||s==='0')d.dataset.sidebar=s==='1'?'collapsed':'expanded'}catch(e){}";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();

  return {
    // Link previews need absolute URLs; see siteOrigin for why it is not configured.
    metadataBase: new URL(await siteOrigin()),
    title: {
      default: t.meta.defaultTitle,
      template: t.meta.titleTemplate,
    },
    description: t.meta.description,
    openGraph: {
      siteName: "Antiginx",
      title: t.meta.defaultTitle,
      description: t.meta.description,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
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
      {/*
        The font variables live on <body>: the theme bootstrap above rewrites
        <html>'s class. Tailwind sets the default font on <html>, where those
        variables do not exist, so <body> sets the sans font itself.
      */}
      <body
        className={`${googleSans.variable} ${geistMono.variable} font-sans antialiased`}
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
