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
  metadataBase: new URL("https://www.akihabaratcgwarehouse.com"),
  title: "Japanese & English TCG Cards | Pokemon, One Piece, Gundam | Akihabara TCG Warehouse",
  description:
    "Shop authentic Japanese & English trading card games at Akihabara TCG Warehouse. Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam Card Game & Disney Lorcana. Direct from Japan, 100% Authentic, Ships Worldwide.",
  keywords: [
    "Japanese Pokemon cards",
    "Japanese One Piece cards",
    "Pokemon booster box Japanese",
    "One Piece booster box",
    "Akihabara card shop",
    "Akihabara TCG",
    "authentic Japanese booster box",
    "Japan imported TCG",
    "Japan import trading cards",
    "Pokemon cards from Japan",
    "Japanese TCG cards online",
    "Akihabara warehouse cards",
    "Tokyo card shop online",
    "TCG",
    "Pokemon Cards",
    "One Piece Cards",
    "Dragon Ball Cards",
    "Weiss Schwarz",
    "Union Arena",
    "Gundam Card Game",
    "Disney Lorcana",
    "Booster Box",
    "Sealed Case",
    "Elite Trainer Box",
    "trading card game",
    "collectible cards",
    "preorder TCG",
    "Yu-Gi-Oh cards",
    "hololive cards",
  ],
  authors: [{ name: "Akihabara TCG Warehouse" }],
  creator: "Akihabara TCG Warehouse",
  publisher: "Akihabara TCG Warehouse",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.akihabaratcgwarehouse.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon-32.png?v=3", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png?v=3",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Japanese & English TCG Cards | Akihabara TCG Warehouse",
    description:
      "Shop authentic Japanese & English trading card games. Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam & more. Direct from Japan, 100% Authentic, Ships Worldwide.",
    type: "website",
    url: "https://www.akihabaratcgwarehouse.com",
    siteName: "Akihabara TCG Warehouse",
    locale: "en_US",
    images: [{ url: "/og-image.png?v=3", width: 1200, height: 630, alt: "Akihabara TCG Warehouse - Premium Japanese TCG Cards" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Japanese & English TCG Cards | Akihabara TCG Warehouse",
    description:
      "Shop authentic Japanese & English trading card games. Pokemon, One Piece, Dragon Ball & more. Direct from Japan, Ships Worldwide.",
    images: ["/og-image.png?v=3"],
  },
  category: "Shopping",
  classification: "Trading Card Games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Akihabara TCG Warehouse",
        url: "https://www.akihabaratcgwarehouse.com",
        logo: "https://www.akihabaratcgwarehouse.com/logo.png",
        description: "Premium Japanese & English TCG card shop based in Akihabara, Tokyo. Authentic Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam & Disney Lorcana trading card games.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Akihabara",
          addressRegion: "Tokyo",
          addressCountry: "JP",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+81-80-2935-0455",
          contactType: "customer service",
          availableLanguage: ["English", "Japanese"],
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "Akihabara TCG Warehouse",
        url: "https://www.akihabaratcgwarehouse.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.akihabaratcgwarehouse.com/?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.akihabaratcgwarehouse.com",
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preload" href="/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.webp" as="image" />
        <link rel="preload" href="/logo.png?v=3" as="image" />
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
