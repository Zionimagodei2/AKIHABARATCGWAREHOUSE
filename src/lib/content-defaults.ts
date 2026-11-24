/* ────────────────────────────────────────────────────────────
   Compiled content defaults — the CURRENT live text of the site.

   These are the instant fallback everywhere: the storefront renders
   them before /api/site-content answers, server pages use them when
   the database is unreachable, and the first admin draft is seeded
   from them, so publishing an untouched draft changes nothing.

   heroSlides / announcements / settings are seeded from the LIVE
   https://www.akihabaratcgwarehouse.com/content.json (fetched
   2026-11-24), NOT from the local public/content.json, which can be
   stale. The editorial keys (sets / guides / calendar) are seeded
   server-side from content-data.ts — see site-content.ts — so this
   module stays free of the big editorial payloads for the browser.
   ──────────────────────────────────────────────────────────── */

import type {
  ClientSiteContent,
  SiteSettings,
} from "./content-types";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Akihabara TCG Warehouse",
  whatsappNumber: "+81 80-2935-0455",
  currency: "USD",
  currencyJPY: "149.5",
  currencyEUR: "0.92",
  currencyGBP: "0.79",
  freeShippingThreshold: 500,
  standardShippingFee: 15,
  paymentMethods: [
    { id: "wise", label: "Wise", instructions: "Fast & Secure for International Payments" },
    { id: "zelle_chime_cashapp", label: "Zelle, Chime or Cash App", instructions: "Please contact us on WhatsApp first before sending" },
    { id: "apple_google_pay", label: "Apple Pay or Google Pay", instructions: "Tap to Pay on supported devices" },
    { id: "bank_transfer", label: "Bank Transfer", instructions: "Direct bank wire transfer" },
    { id: "credit_card", label: "Credit / Debit Card", instructions: "Visa, Mastercard, AMEX" },
    { id: "crypto", label: "Cryptocurrency", instructions: "BTC, ETH, USDT" },
  ],
  storeEmail: "support@akihabaratcgwarehouse.com",
};

export const DEFAULT_CONTENT: ClientSiteContent = {
  settings: DEFAULT_SETTINGS,

  /* Seeded verbatim from the live /content.json (2026-11-24). */
  heroSlides: [
    {
      id: "slide-mubb7qx1",
      image: "/images/products/hero-m6a-30th-celebration.webp",
      title: "    Pokémon TCG 30th Celebration",
      subtitle: "    The 30th Anniversary Collection Is Now In Stock",
      accent: "New",
      order: 2,
      active: true,
      productId: "p-mu7swctq6ign",
    },
    {
      id: "slide-mubbggs0",
      image: "/images/products/hero-op-17.webp",
      title: "    ONE PIECE OP-17",
      subtitle: "    OP-17 Cases/Booster Boxes In Stock",
      accent: "New ",
      order: 3,
      active: true,
      productId: "268",
    },
    {
      id: "slide-mubbkidg",
      image: "/images/onepiece-english/op-18-bb.webp",
      title: "    ONE PIECE OP-18",
      subtitle: "Pre order ",
      accent: "Sealed cases/ Booster boxes",
      order: 1,
      active: true,
      productId: "276",
    },
    {
      id: "slide-muszbmmm",
      image: "/images/products/hero-slide-4.webp",
      title: "One piece EB-05",
      subtitle: "Sealed cases/ Booster boxes ",
      accent: "New ",
      order: 0,
      active: true,
      productId: "p-musytfk059vm",
    },
  ],

  announcements: [
    { id: "ann-1", message: "Free Shipping on Orders Over $500", active: true, order: 0 },
    { id: "ann-2", message: "Direct from Japan — 100% Authentic Sealed Products", active: true, order: 1 },
    { id: "ann-3", message: "Ships Worldwide — Secure Packaging Guaranteed", active: true, order: 2 },
    { id: "ann-4", message: "Trusted by Thousands of Collectors Worldwide", active: true, order: 3 },
    { id: "ann-5", message: "Guaranteed Authenticity on Every Item We Sell", active: true, order: 4 },
  ],

  home: {
    warehouseEyebrow: "Direct from Japan",
    warehouseTitle: "Our Warehouse",
    warehouseTrackImages: [
      "/images/warehouse-1.webp",
      "/images/warehouse-2.webp",
      "/images/warehouse-1.webp",
      "/images/warehouse-2.webp",
      "/images/warehouse-1.webp",
      "/images/warehouse-2.webp",
    ],
    warehouseWideImage: "/images/warehouse-3.webp",
    warehouseWideAlt: "Akihabara TCG Warehouse - Inside View",
    trustBadges: [
      { icon: "Shield", title: "100% Authentic", desc: "Verified products" },
      { icon: "Truck", title: "Free Shipping", desc: "Orders over {threshold}" },
      { icon: "Globe", title: "Worldwide", desc: "Secure delivery" },
      { icon: "Package", title: "Direct from Japan", desc: "Trusted suppliers" },
    ],
    collectionEyebrow: "Featured Selection",
    collectionTitle: "Our Collection",
    collectionSub: "Hand-picked highlights from each category",
    whyEyebrow: "Trusted Worldwide",
    whyTitle: "Why Choose Akihabara TCG Warehouse",
    whyIntro:
      "Your premier source for authentic Japanese & English TCG products — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam, Disney Lorcana, and more. Whether you're a seasoned collector, a competitive player, or running a card business, we've got you covered.",
    features: [
      { icon: "Shield", title: "Guaranteed Authenticity", desc: "Every item we sell is verified through trusted third-party channels. No counterfeits, ever." },
      { icon: "Globe", title: "Direct from Japan", desc: "We work closely with Japanese suppliers to bring you exclusive releases and rare cards." },
      { icon: "Package", title: "Wholesale & Individual", desc: "Whether you're buying one box or a pallet, we've got you covered at unbeatable prices." },
      { icon: "Truck", title: "Careful, Fast Delivery", desc: "Secure packaging and prompt worldwide shipping ensure your order arrives safely." },
      { icon: "Heart", title: "Reliable Support", desc: "Need assistance? Our support team is available 24/7 to guide and assist you." },
      { icon: "Star", title: "Our Guarantee", desc: "We strictly avoid counterfeits and resealed packs — your trust is our top priority." },
    ],
    includesTitle: "Our Collection Includes",
    includes: [
      { title: "Booster Boxes & Packs", desc: "Newly released sets and collector favorites" },
      { title: "Decks & Special Sets", desc: "Ready-to-play and collector editions" },
      { title: "Singles & Graded Cards", desc: "Vintage holos to PSA-graded rarities" },
      { title: "Bulk & Wholesale", desc: "Perfect for retailers and resellers" },
    ],
    reviewsEyebrow: "Testimonials",
    reviewsTitle: "What Our Clients Say",
    reviews: [
      { name: "Kingsley Chandler", rating: 5, quote: "I've been collecting Pokémon cards for years, and these are some of the best! The quality is fantastic, and the rare cards are definitely worth it. My collection has never looked better!" },
      { name: "Orson Lancaster", rating: 5, quote: "I love how these cards not only look great but are also perfect for battling. Whether you're a competitive player or just a fan, these cards are a must-have!" },
      { name: "Harleigh Dodson", rating: 5, quote: "I ordered these cards and was amazed at how quickly they arrived. The cards were in perfect condition, and I can't wait to add them to my deck!" },
      { name: "Lucas RH", rating: 5, quote: "I've been collecting Pokémon cards for over a decade, and these are some of the most beautiful and rare cards I've come across. Truly a treasure for any serious collector!" },
      { name: "Simons L.", rating: 5, quote: "The quality of these cards is top-notch! They arrived in perfect condition and the holographic designs are just stunning. Definitely worth the investment!" },
      { name: "Benette SH.", rating: 5, quote: "I ordered these cards for a special event, and they arrived on time and in perfect condition. Great service and an awesome product." },
      { name: "Annah Jip", rating: 5, quote: "I was blown away by the value of these cards. Not only do you get rare and powerful Pokémon, but the price was more than fair. Highly recommend!" },
      { name: "Tilamans", rating: 5, quote: "These cards really helped me improve my strategy and power up my deck. Whether you're a seasoned player or just starting out, these cards are a fantastic choice!" },
      { name: "Megan P.", rating: 5, quote: "Amazing card quality! The quality of these cards is top-notch! They arrived in perfect condition and the holographic designs are just stunning. Definitely worth the investment!" },
    ],
  },

  about: {
    eyebrow: "About Us",
    title: "Trusted Worldwide for Japanese Pokémon TCG and Others",
    intro:
      "Welcome to Akihabara TCG Warehouse, your premier source for authentic Japanese & English TCG products. From Pokémon and One Piece to Dragon Ball, Weiss Schwarz, Union Arena, Gundam, and Disney Lorcana — whether you're a seasoned collector, a competitive player, or running a card business, we offer genuine items at unbeatable prices.",
    purposeEyebrow: "Our Purpose",
    purposeTitle: "Connecting fans with the cards they love",
    purposeParagraphs: [
      "We're here to connect fans around the globe with the most exciting and hard-to-find Japanese Pokémon cards. Our focus is to make every order secure, every card legitimate, and every customer experience smooth and satisfying.",
      "Based in the heart of Akihabara, Tokyo's legendary electronics and hobby district, we have direct access to the newest releases, rarest finds, and best prices. We pass those savings on to you.",
    ],
    trustTitle: "Why Thousands Trust Us",
    trustItems: [
      { icon: "Shield", title: "Guaranteed Authenticity", desc: "Every item verified through trusted third-party channels" },
      { icon: "Globe", title: "Direct from Japan", desc: "Exclusive releases and rare cards from Japanese suppliers" },
      { icon: "Package", title: "Wholesale & Individual Sales", desc: "One box or a pallet — we've got you covered" },
      { icon: "Truck", title: "Careful, Fast Delivery", desc: "Secure packaging and prompt worldwide shipping" },
      { icon: "Heart", title: "Reliable Support", desc: "Our team is available 24/7 to assist you" },
    ],
    carryEyebrow: "What We Carry",
    carryTitle: "Our Collection Includes",
    carryItems: [
      { icon: "Package", title: "Booster Boxes & Packs", desc: "Newly released sets and collector favorites from every era." },
      { icon: "Star", title: "Decks & Special Sets", desc: "Ready-to-play options and collector editions for every level." },
      { icon: "Shield", title: "Singles & Graded Cards", desc: "From vintage holos to top-tier promos and PSA-graded rarities." },
      { icon: "Globe", title: "Bulk Orders & Wholesale", desc: "Perfect for retailers and high-volume resellers." },
    ],
    guaranteeTitle: "Our Guarantee to You",
    guaranteeParagraphs: [
      "At Akihabara TCG Warehouse, we stand by the integrity of every product across all our lines — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam, and more. We strictly avoid counterfeits and resealed packs — your satisfaction and trust are our top priorities.",
      "Join the growing number of international customers who rely on us for safe, affordable access to authentic Japanese TCG products. Begin your journey or expand your inventory today.",
    ],
  },

  shipping: {
    eyebrow: "Shipping Policy",
    title: "Shipping & Delivery",
    intro:
      "We ship worldwide from Tokyo, Japan. Here's everything you need to know about how your order gets to you.",
    sections: [
      {
        title: "Free Shipping Threshold",
        content:
          "Orders over {threshold} qualify for free standard international shipping. This is automatically applied at checkout — no coupon needed.",
      },
      {
        title: "Shipping Methods & Times",
        content:
          "We offer two primary shipping methods:\n\n• Standard International (10–21 business days) — Free on orders over {threshold}, otherwise calculated at checkout.\n• Express International (5–10 business days) — Available at an additional cost. Select at checkout.\n\nPlease note: delivery times are estimates and may vary depending on your country's customs processing.",
      },
      {
        title: "Where We Ship",
        content:
          "We currently ship to over 50 countries including the United States, Canada, the United Kingdom, the European Union, Australia, and most of Southeast Asia. If your country isn't listed at checkout, reach out to us and we'll try to accommodate you.",
      },
      {
        title: "Packaging",
        content:
          "All orders are carefully packed in sturdy, protective packaging to prevent damage during transit. Booster boxes and sealed cases are wrapped in bubble padding and placed in reinforced cardboard boxes. Singles are shipped in toploaders or card savers.",
      },
      {
        title: "Tracking",
        content:
          "Once your order ships, you'll receive a tracking number via email. You can use this to follow your package from our warehouse in Tokyo all the way to your door.",
      },
      {
        title: "Customs & Import Duties",
        content:
          "International shipments may be subject to customs duties and import taxes levied by your country. These charges are the responsibility of the buyer and are not included in our product prices or shipping costs. We declare the actual value of goods on all shipments.",
      },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    intro:
      "Got questions? We've got answers. If you don't see what you're looking for, feel free to reach out to us directly.",
    items: [
      { q: "Are your products authentic?", a: "Yes, 100%. Every product we sell is sourced directly from authorized Japanese distributors and verified through trusted third-party channels. We do not sell counterfeits or resealed products — ever." },
      { q: "Do you sell individual cards or singles?", a: "Yes, we carry a selection of singles and graded cards. Our primary focus is sealed products (booster boxes, elite trainer boxes, sealed cases), but we do offer high-demand singles and PSA-graded cards." },
      { q: "What payment methods do you accept?", a: "We accept Wise, Zelle, Chime, Cash App, Apple Pay, Google Pay, bank transfers, all major credit cards (Visa, Mastercard, American Express), and cryptocurrency. We confirm the payment details with you directly when your order is placed." },
      { q: "How long does shipping take?", a: "Standard international shipping takes 10–21 business days. Express shipping takes 5–10 business days. Delivery times may vary depending on your country's customs processing." },
      { q: "Do you offer wholesale pricing?", a: "Yes! We offer competitive wholesale pricing on bulk orders and sealed cases. Contact us at support@akihabaratcgwarehouse.com with details about what you need and we'll send you a custom quote." },
      { q: "What if my order arrives damaged?", a: "We take great care in packaging, but if your order arrives damaged, contact us within 48 hours with photos and we'll arrange a replacement or full refund." },
      { q: "Can I return or exchange a product?", a: "We accept returns within 30 days of delivery for sealed, unopened products in their original condition. Opened products are not eligible for return. See our full return policy for details." },
      { q: "How are your prices so much lower than other shops?", a: "We source directly from Japanese distributors and operate with lower overhead than most Western retailers. We pass those savings on to our customers. Our products are the exact same authentic items you'd find elsewhere — just at better prices." },
      { q: "Do you restock sold-out items?", a: "We restock popular items regularly, but some limited-edition products may not be restocked once they sell out. Sign up for our newsletter or follow us on social media to get restock alerts." },
      { q: "Is it safe to order from overseas?", a: "Absolutely. We use SSL encryption on our website, process payments through secure gateways, and ship with full tracking. We've successfully delivered thousands of orders to customers in over 50 countries." },
    ],
  },

  contact: {
    eyebrow: "Contact Us",
    title: "Get in Touch",
    intro: "Have a question, special request, or need help with an order? We're here for you.",
    cards: [
      { icon: "Mail", title: "Email", detail: "support@akihabaratcgwarehouse.com", sub: "We reply within 24 hours" },
      { icon: "Clock", title: "Business Hours", detail: "Mon — Sat: 9AM — 6PM JST", sub: "Sunday: Closed" },
      { icon: "MapPin", title: "Location", detail: "Akihabara, Tokyo", sub: "Japan" },
    ],
    formTitle: "Send Us a Message",
    chatBubble: "Questions? We reply fast on WhatsApp",
    chatTitle: "Chat with us",
    chatStatus: "Online now",
  },

  footer: {
    blurb:
      "Your trusted source for authentic Japanese & English TCG products — Pokémon, One Piece, Dragon Ball, and more. Every product ships sealed and verified.",
    navHeading: "Navigation",
    categoriesHeading: "Categories",
    contactHeading: "Get in Touch",
    emailSub: "We reply within 24 hours",
    hours: "Mon — Sat: 9AM — 6PM JST",
    hoursSub: "Sunday: Closed",
    location: "Akihabara, Tokyo",
    locationSub: "Japan",
    copyrightText: "Akihabara TCG Warehouse. All rights reserved.",
    badges: ["Secure Checkout", "SSL Encrypted", "30-Day Returns"],
  },

  checkout: {
    eyebrow: "Secure Checkout",
    title: "Complete Your Order",
    introHtml:
      "Fill in your details below, then hit <span class=\"font-semibold text-[#2fe671]\">Send Order via WhatsApp</span> — your order opens in WhatsApp, pre-filled and ready to send. All orders ship direct from Japan.",
    emptyTitle: "Checkout",
    emptyText: "Your cart is empty.",
    thankYouTitle: "One Last Step — Send on WhatsApp",
    thankYouRefLabel: "Your order reference is:",
    thankYouTextWa:
      "We've prepared your order message — if WhatsApp didn't open automatically, tap the green button below, check the pre-filled order details and press <span class=\"text-white font-medium\">Send</span>. Our team will confirm payment and shipping shortly.",
    thankYouTextNoWa:
      "We've saved your order details. Our team will confirm payment and shipping within 24 hours. You can also reach us on WhatsApp at <span class=\"text-white font-medium\">{phone}</span>.",
    sendButtonLabel: "Send Order on WhatsApp",
    sendButtonSub: "Opens WhatsApp with your order details pre-filled — just press Send.",
    whatsappTemplate: [
      "*New Order — {orderId}*",
      "{siteName}",
      "",
      "*Items*",
      "{items}",
      "",
      "Subtotal: {subtotal}",
      "Shipping: {shipping}",
      "*Total: {total}*",
      "",
      "Name: {name}",
      "Email: {email}",
      "Phone: {phone}",
      "Ship to: {address}",
      "Payment: {payment}",
      "{notesLine}",
      "",
      "— sent from akihabaratcgwarehouse.com",
    ].join("\n"),
  },

  categoryPages: {
    Pokemon: {
      key: "Pokemon",
      slug: "/pokemon-cards",
      metaTitle: "Japanese Pokemon Cards — Booster Boxes | Akihabara TCG",
      metaDescription:
        "Authentic Japanese Pokemon cards: booster boxes, sealed cases & special sets. Factory sealed, direct from Japan, ships worldwide.",
      keywords: [
        "Japanese Pokemon cards",
        "Pokemon booster box Japanese",
        "Japanese Pokemon booster box",
        "buy Japanese Pokemon cards online",
        "Japanese Pokemon TCG",
        "Pokemon cards from Japan",
        "Japanese Pokemon special set",
        "Pokemon sealed case Japanese",
        "Japanese Pokemon sealed case",
        "Akihabara Pokemon cards",
      ],
      h1: "Japanese Pokémon Cards",
      eyebrow: "Pokémon TCG · Direct from Japan",
      intro:
        "Shop {count} authentic Japanese Pokémon cards direct from Akihabara, Tokyo — the world capital of trading card games. Our Pokémon collection spans the newest Scarlet & Violet era sets alongside modern classics, from single booster boxes and complete sealed display cases to special sets and limited promotional products. Japanese Pokémon booster boxes are prized by collectors worldwide for their exclusive artwork, earlier release dates and different pull rates compared to English sets, making them the preferred format for serious collectors and players. Every item we sell is factory sealed and sourced directly from authorized Japanese distributors, then shipped worldwide in protective packaging with full tracking. Orders over $500 ship free, and every purchase is backed by our 100% authenticity guarantee and 30-day returns on sealed products.",
      sectionOrder: ["Sealed Case", "Booster Boxes", "Special Set & Promo", "Promo"],
      sectionTitles: {
        "Sealed Case": "Pokémon Sealed Cases",
        "Booster Boxes": "Pokémon Booster Boxes",
        "Special Set & Promo": "Pokémon Special Sets & Promos",
        Promo: "Pokémon Promo Cards",
      },
      sectionDescriptions: {
        "Sealed Case":
          "Complete sealed display cases of 12 or 20 booster boxes — the best per-box pricing for collectors, stores and serious players.",
        "Booster Boxes":
          "Factory-sealed Japanese Pokémon booster boxes from the latest expansions — Scarlet & Violet era sets, legacy classics and everything between.",
        "Special Set & Promo":
          "Special sets, premium collections and promotional releases, including hard-to-find Japanese exclusives.",
        Promo: "Limited promotional Pokémon cards and products — perfect for completing a collection.",
      },
      heroImage: "/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.webp",
      heroPills: ["{count} products in stock", "100% authentic", "Free shipping over {threshold}", "Ships worldwide"],
      exploreTitle: "Explore More TCG Collections",
      footerTagline: "Authentic Japanese TCG cards · Direct from Akihabara, Tokyo · Ships worldwide",
    },

    "Japanese One Piece": {
      key: "Japanese One Piece",
      slug: "/one-piece-cards",
      metaTitle: "Japanese One Piece Cards — Booster Boxes | Akihabara TCG",
      metaDescription:
        "Authentic Japanese One Piece Card Game: OP booster boxes & sealed cases. Factory sealed, direct from Japan, ships worldwide.",
      keywords: [
        "Japanese One Piece cards",
        "One Piece card game Japanese",
        "One Piece booster box Japanese",
        "Japanese One Piece booster box",
        "OP card game Japanese",
        "buy Japanese One Piece cards online",
        "One Piece sealed case Japanese",
        "Akihabara One Piece cards",
      ],
      h1: "Japanese One Piece Card Game",
      eyebrow: "Japanese One Piece · Direct from Japan",
      intro:
        "The One Piece Card Game has become one of the most sought-after trading card games in the world, and Japanese-language product leads the market. We stock {count} authentic Japanese One Piece products direct from Akihabara — from the latest OP-series booster boxes and complete sealed display cases to special sets and promos. Japanese One Piece boxes release months ahead of English sets, often feature exclusive Japanese artwork, and are the preferred choice for collectors chasing the newest cards first. Everything is factory sealed, sourced from authorized Japanese distributors, and shipped worldwide with tracking and protective packaging. Enjoy free shipping on orders over $500 plus our 100% authenticity guarantee and 30-day returns on sealed products.",
      sectionOrder: ["Sealed Case", "Booster Boxes", "Special Set"],
      sectionTitles: {
        "Sealed Case": "Japanese One Piece Sealed Cases",
        "Booster Boxes": "Japanese One Piece Booster Boxes",
        "Special Set": "Japanese One Piece Special Sets",
      },
      sectionDescriptions: {
        "Sealed Case": "Complete sealed display cases — the best per-box pricing for collectors, stores and serious players.",
        "Booster Boxes": "Factory-sealed Japanese One Piece booster boxes from OP-07 through the newest expansions.",
        "Special Set": "Special sets and collections, including Japanese-exclusive releases.",
      },
      heroImage: "/images/existing/5942991877667752868_121-1024x579.webp",
      heroPills: ["{count} products in stock", "100% authentic", "Free shipping over {threshold}", "Ships worldwide"],
      exploreTitle: "Explore More TCG Collections",
      footerTagline: "Authentic Japanese TCG cards · Direct from Akihabara, Tokyo · Ships worldwide",
    },

    "English One Piece": {
      key: "English One Piece",
      slug: "/english-one-piece-cards",
      metaTitle: "English One Piece Cards — Booster Boxes | Akihabara TCG",
      metaDescription:
        "English One Piece Card Game booster boxes & sealed cases. 100% authentic, factory sealed, ships worldwide from Japan.",
      keywords: [
        "English One Piece cards",
        "One Piece card game English",
        "English One Piece booster box",
        "One Piece booster box English",
        "OP booster box English",
        "buy English One Piece cards online",
        "English One Piece sealed case",
        "One Piece 12 box case",
        "Romance Dawn booster box English",
        "One Piece TCG sealed product",
        "Emperors in the New World booster box",
        "Legacy of the Master booster box English",
        "Memorial Collection booster box English",
        "Anime 25th Collection booster box English",
      ],
      h1: "English One Piece Card Game",
      eyebrow: "English One Piece · Sealed Cases & Booster Boxes",
      intro:
        "The English edition of the One Piece Card Game is the tournament-standard format played around the world — and we stock the deepest sealed selection anywhere. This collection brings together {count} English One Piece products: every main-set booster box from OP-01 Romance Dawn through OP-17 The World's Strongest Warriors, the Memorial Collection, Anime 25th Collection and Heroines extra boosters, The Best premium boosters, and complete factory-sealed 12-box display cases for collectors, stores and box breakers. English boxes contain 24 booster packs per display and pull the same leader, alt-art and secret rare chase cards as their Japanese counterparts, fully legal for official tournaments. Every item is factory sealed from authorized North American distribution, shipped worldwide with tracking and protective packaging, and covered by our 100% authenticity guarantee with free shipping over $500 and 30-day returns on sealed products.",
      sectionOrder: ["Sealed Case", "Booster Boxes"],
      sectionTitles: {
        "Sealed Case": "English One Piece Sealed Cases",
        "Booster Boxes": "English One Piece Booster Boxes",
      },
      sectionDescriptions: {
        "Sealed Case": "Complete factory-sealed 12-box display cases — distribution-level product with the best per-box pricing for collectors, stores and box breakers.",
        "Booster Boxes": "Factory-sealed English One Piece booster boxes — every main expansion from Romance Dawn to the latest releases, plus extra and premium boosters.",
      },
      heroImage: "/images/onepiece-english/hero-english-op.webp",
      heroPills: ["{count} products in stock", "100% authentic", "Free shipping over {threshold}", "Ships worldwide"],
      exploreTitle: "Explore More TCG Collections",
      footerTagline: "Authentic Japanese TCG cards · Direct from Akihabara, Tokyo · Ships worldwide",
    },

    "Other TCG": {
      key: "Other TCG",
      slug: "/japanese-tcg",
      metaTitle: "Japanese TCG Cards — Dragon Ball & More | Akihabara TCG",
      metaDescription:
        "Authentic Japanese TCG: Dragon Ball, Weiss Schwarz, Union Arena & Gundam. Factory sealed, direct from Japan, ships worldwide.",
      keywords: [
        "Japanese TCG",
        "Weiss Schwarz cards",
        "Union Arena cards",
        "Dragon Ball Fusion World",
        "Gundam card game",
        "Disney Lorcana Japanese",
        "hololive card game",
        "Japanese trading card games online",
        "Akihabara TCG shop",
      ],
      h1: "Japanese Trading Card Games — Weiss Schwarz, Union Arena, Dragon Ball & More",
      eyebrow: "Japanese TCG Brands · Direct from Japan",
      intro:
        "Beyond Pokémon and One Piece, Japan produces some of the most exciting trading card games on the planet — and we stock them all direct from Akihabara. This collection brings together {count} products from Weiss Schwarz, Union Arena, Dragon Ball Fusion World, the Gundam Card Game, Disney Lorcana, hololive and other sought-after Japanese titles. Whether you are hunting anime crossover sets from Weiss Schwarz, tournament staples from Union Arena, or collector-favorite Dragon Ball and Gundam releases, every item is factory sealed and sourced from authorized Japanese distributors. All orders ship worldwide with tracking, free shipping applies over $500, and our 100% authenticity guarantee covers everything we sell.",
      sectionTitles: {
        "hololive CG": "hololive Card Game",
        "Union Arena": "Union Arena",
        "Dragon Ball": "Dragon Ball Fusion World",
        Gundam: "Gundam Card Game",
        "Weiss Schwarz": "Weiss Schwarz",
        Lorcana: "Disney Lorcana",
        Lycee: "Lycee TCG",
        OSICA: "OSICA (Oshi no Ko)",
      },
      sectionDescriptions: {
        "Weiss Schwarz": "The original anime crossover card game from Bushiroad, spanning hit franchises with English and Japanese releases.",
        "Union Arena": "Bandai's crossover TCG featuring characters from the world's biggest anime and manga franchises.",
        "Dragon Ball": "Dragon Ball Fusion World booster boxes and sets — the modern Dragon Ball card game format.",
        Gundam: "Gundam Card Game products direct from Japan, sealed and collector-ready.",
        Lorcana: "Disney Lorcana sealed products — the collectible Disney TCG taking the world by storm.",
        "hololive CG": "hololive Card Game sets featuring VTuber talents from Hololive Production.",
      },
      heroImage: "/images/existing/UNI.jpg",
      heroPills: ["{count} products in stock", "100% authentic", "Free shipping over {threshold}", "Ships worldwide"],
      exploreTitle: "Explore More TCG Collections",
      footerTagline: "Authentic Japanese TCG cards · Direct from Akihabara, Tokyo · Ships worldwide",
    },
  },

  seo: {
    title: "Japanese & English TCG Cards | Akihabara TCG Warehouse",
    description:
      "Authentic Japanese & English Pokémon, One Piece and Dragon Ball booster boxes. Factory sealed, direct from Japan, ships worldwide.",
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
    paymentAccepted:
      "Wise, Zelle, Chime, Cash App, Apple Pay, Google Pay, Credit Card, Bank Transfer, Cryptocurrency",
    storeDescription:
      "Premium Japanese & English TCG card shop based in Akihabara, Tokyo. Authentic Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam & Disney Lorcana trading card games.",
    h1: "Akihabara TCG Warehouse — Authentic Japanese & English TCG Cards: Pokemon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam & Disney Lorcana",
  },

  blog: {
    metaTitle: "TCG Blog: Collecting Advice from the Shop Floor",
    metaDescription:
      "Honest TCG collecting advice from Akihabara TCG Warehouse: Japanese vs English, pre-order timing, spotting fakes, and set breakdowns.",
    eyebrow: "Blog",
    title: "From the Shop Floor",
    intro:
      "What we've learned selling Japanese and English TCG sealed product every day: which sets are worth your money, how release pricing actually behaves, and the mistakes we watch collectors make. No fluff — if an article doesn't help you decide something, we don't publish it.",
    byline: "By the Warehouse",
    bottomLineTitle: "The bottom line",
    ctaTitle: "Put it into practice",
    ctaText:
      "Browse our sealed Japanese and English TCG — every box authentic, sourced direct from Japan.",
    ctaLabel: "Shop sealed product",
    faqTitle: "Frequently asked questions",
    relatedTitle: "Keep reading",
  },
};
