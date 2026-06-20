import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Akihabara TCG Warehouse — Premium Japanese & English TCG Cards",
  description:
    "Your premier source for authentic Japanese Pokémon TCG, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam Card Game & Disney Lorcana. Direct from Japan, 100% Authentic, Ships Worldwide.",
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
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
