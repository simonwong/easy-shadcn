import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { baseUrl, createMetadata } from "@/lib/metadata";
import "./globals.css";
import type { Viewport } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: {
    template: "%s | Easy Shadcn",
    default: "Easy Shadcn",
  },
  description: "Use Shadcn UI with ease",
  metadataBase: baseUrl,
});

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#fff" },
  ],
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      className={cn(mono.variable, "font-sans", figtree.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
