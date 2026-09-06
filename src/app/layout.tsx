import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";

export const metadata: Metadata = {
  title: "Gestock — Inventário & Arrumação Dinâmica",
  description: "Gestão inteligente de inventário com foto nativa e alocação hierárquica.",
  manifest: "/manifest.json",
  icons: {
    icon: "/mainicon.png",
    shortcut: "/mainicon.png",
    apple: "/mainicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gestock",
  },
};

export const viewport: Viewport = {
  themeColor: "#151016",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full bg-[#151016] text-[#f3f0f5]" data-theme="homebox" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/mainicon.png" type="image/png" />
        <link rel="shortcut icon" href="/mainicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/mainicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('gestock-theme') || 'homebox';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="min-h-full bg-[#151016] text-[#f3f0f5] antialiased font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <PWARegister />
          {children}
          <ThemeSelectorModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
