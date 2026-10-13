import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Timecraft",
  description: "Esculpa seu tempo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
      className={cn("h-full", "antialiased", oxanium.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
