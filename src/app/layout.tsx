import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#581c87" },
  ],
};

export const metadata: Metadata = {
  title: "Akihabara TCG Warehouse — Premium Japanese & English TCG Cards",
  description:
    "Your premier source for authentic Japanese TCG products — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam Card Game & Disney Lorcana. Direct from Japan, 100% Authentic, Ships Worldwide.",
  keywords: [
    "Akihabara",
    "TCG",
    "Pokemon Cards",
    "Japanese Pokemon",
    "One Piece Cards",
    "Dragon Ball Cards",
    "Weiss Schwarz",
    "Union Arena",
    "Gundam Card Game",
    "Disney Lorcana",
    "Booster Box",
    "Elite Trainer Box",
  ],
  authors: [{ name: "Akihabara TCG Warehouse" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Akihabara TCG Warehouse",
    description:
      "Premium Japanese & English TCG Cards — Direct from Japan, 100% Authentic",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.avif" as="image" />
        <link rel="preload" href="/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif" as="image" />
        <link rel="preload" href="/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif" as="image" />
        <link rel="preload" href="/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif" as="image" />
        <link rel="preload" href="/logo.png?v=2" as="image" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
