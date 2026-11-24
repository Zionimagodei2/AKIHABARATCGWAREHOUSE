import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import TawkChat from "@/components/tawk-chat";
import { getPublishedContent } from "@/lib/site-content";

/* Metadata + JSON-LD read the published site content at request time
   (admin-editable SEO key + settings), failing soft to the compiled
   defaults — which are the values this file used to hardcode. */
export const dynamic = "force-dynamic";

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

export async function generateMetadata(): Promise<Metadata> {
  const { seo, settings } = await getPublishedContent();
  return {
    metadataBase: new URL("https://www.akihabaratcgwarehouse.com"),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    publisher: settings.siteName,
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
      languages: {
        "en": "https://www.akihabaratcgwarehouse.com",
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico?v=4" },
        { url: "/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
      ],
      apple: "/apple-touch-icon.png?v=4",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: "https://www.akihabaratcgwarehouse.com",
      siteName: settings.siteName,
      locale: "en_US",
      images: [{ url: "/og-image.png?v=3", width: 1200, height: 630, alt: "Akihabara TCG Warehouse - Premium Japanese TCG Cards" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/og-image.png?v=3"],
    },
    category: "Shopping",
    classification: "Trading Card Games",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { seo, settings } = await getPublishedContent();
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": "https://www.akihabaratcgwarehouse.com/#store",
        name: settings.siteName,
        url: "https://www.akihabaratcgwarehouse.com",
        logo: "https://www.akihabaratcgwarehouse.com/store-logo.webp",
        description: seo.storeDescription,
        image: "https://www.akihabaratcgwarehouse.com/og-image.png",
        priceRange: "$$",
        currenciesAccepted: "USD, JPY, EUR, GBP",
        paymentAccepted: seo.paymentAccepted,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Akihabara",
          addressRegion: "Tokyo",
          addressCountry: "JP",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 35.7023,
          longitude: 139.7745,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "10:00",
            closes: "20:00",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: settings.whatsappNumber.replace(/ /g, "-"),
          email: settings.storeEmail,
          contactType: "customer service",
          availableLanguage: ["English", "Japanese"],
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: settings.siteName,
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
        <link rel="preload" href="/store-logo.webp" as="image" />
        {/* Tawk.to live chat — warm up connections early so the chat widget
            appears as soon as possible without blocking page render */}
        <link rel="preconnect" href="https://embed.tawk.to" />
        <link rel="preconnect" href="https://tawk.to" />
        <link rel="preconnect" href="https://va.tawk.to" />
        <link rel="dns-prefetch" href="https://analytics.tawk.to" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <TawkChat />
      </body>
    </html>
  );
}
