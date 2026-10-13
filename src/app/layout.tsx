import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Timecraft",
  description: "Esculpa seu tempo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full", "antialiased", oxanium.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
