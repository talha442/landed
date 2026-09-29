import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { Suspense } from "react";
import { CompareTray } from "@/components/product/CompareTray";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { searchIndex } from "@/lib/catalog";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Landed: the price is the price", template: "%s · Landed" },
  description: "Shop electronics, fashion, beauty and home with every price shown as the total delivered to your door, in your currency.",
};

export const viewport: Viewport = { themeColor: "#f6f5f2" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const index = searchIndex();
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider delayDuration={300}>
          <a href="#main" className="sr-only z-50 rounded-md bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Skip to content
          </a>
          <Suspense fallback={<div className="h-[109px] border-b" />}>
            <SiteHeader index={index} />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <CompareTray />
          <Toaster position="top-center" richColors={false} closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
