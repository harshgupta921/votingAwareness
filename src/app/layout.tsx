import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import CursorGlow from "@/components/CursorGlow";
import SkipToContent from "@/components/accessibility/SkipToContent";
import AccessibilityToolbar from "@/components/accessibility/AccessibilityToolbar";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteIndia - AI Election Assistant",
  description: "AI-powered guide for Indian voters. Get informed, get registered, and get ready to vote.",
};

import { AuthProvider } from "@/contexts/AuthContext";

// Suppress noisy THREE.Clock deprecation warning from @react-three/fiber
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0] && typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('THREE.Clock') || msg.includes('google.maps.Marker')) return;
    originalWarn(...args);
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${plusJakartaSans.variable} ${notoDevanagari.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-transparent text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30 transition-colors duration-300 font-sans`}>
        <ThemeProvider>
          <ScrollProgress />
          <AnimatedBackground />
          <CursorGlow />
          <AuthProvider>
            <LanguageProvider>
            <AccessibilityProvider>
              <SkipToContent />
              <Navbar />
              <main id="main-content" className="flex-1 flex flex-col z-10 relative pt-24 pb-8" tabIndex={-1}>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <AccessibilityToolbar />
            </AccessibilityProvider>
          </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
