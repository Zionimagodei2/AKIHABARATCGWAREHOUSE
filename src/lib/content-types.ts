/* ────────────────────────────────────────────────────────────
   Site content types — the full editable content model.

   One `SiteContent` object carries every editorial string on the
   site. The storefront renders from the PUBLISHED content (newest
   site_publications row) with the compiled defaults in
   content-defaults.ts as instant fallback; the admin panel edits a
   server-side draft of the same shape.

   This module is types-only (plus the SetHub/Guide/CalendarEntry
   type imports, which are erased at compile time) so it is safe to
   import from browser code, server code and the admin panel alike.
   ──────────────────────────────────────────────────────────── */

import type { SetHub, Guide, CalendarEntry } from "./content-data";

export type { SetHub, Guide, CalendarEntry };

/* ── Baseline store content (shapes predate the content system) ── */

export interface StoreHeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  accent: string;
  order: number;
  active: boolean;
  /** Optional explicit product link for the slide's "Shop Now" button. */
  productId?: string | null;
}

export interface StoreAnnouncement {
  id: string;
  message: string;
  active: boolean;
  order: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  /** Instruction line shown on the checkout payment card. */
  instructions: string;
}

export interface SiteSettings {
  siteName: string;
  whatsappNumber: string;
  currency: string;
  /** Exchange rates to 1 USD, as strings (legacy content.json shape). */
  currencyJPY: string;
  currencyEUR: string;
  currencyGBP: string;
  /** THE free-shipping threshold (USD) — the only source, site-wide. */
  freeShippingThreshold: number;
  /** Flat shipping fee (USD) charged below the threshold. */
  standardShippingFee: number;
  /** Ordered payment methods offered at checkout. */
  paymentMethods: PaymentMethod[];
  /** Public contact email shown in the footer / contact page. */
  storeEmail: string;
}

/** The legacy subset the original admin panel sections work with. */
export interface StoreContent {
  heroSlides: StoreHeroSlide[];
  announcements: StoreAnnouncement[];
  settings: SiteSettings;
}

/* ── Page content keys ── */

/** A card with a named lucide icon (icon chosen by name in the editor). */
export interface IconCard {
  icon: string;
  title: string;
  desc: string;
}

export interface HomeContent {
  warehouseEyebrow: string;
  warehouseTitle: string;
  /** Images in the scrolling warehouse strip. */
  warehouseTrackImages: string[];
  /** The wide warehouse photo below the strip. */
  warehouseWideImage: string;
  warehouseWideAlt: string;
  trustBadges: IconCard[];
  collectionEyebrow: string;
  collectionTitle: string;
  collectionSub: string;
  whyEyebrow: string;
  whyTitle: string;
  whyIntro: string;
  features: IconCard[];
  includesTitle: string;
  includes: { title: string; desc: string }[];
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviews: { name: string; quote: string; rating: number }[];
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string;
  purposeEyebrow: string;
  purposeTitle: string;
  purposeParagraphs: string[];
  trustTitle: string;
  trustItems: IconCard[];
  carryEyebrow: string;
  carryTitle: string;
  carryItems: IconCard[];
  guaranteeTitle: string;
  guaranteeParagraphs: string[];
}

export interface ShippingContent {
  eyebrow: string;
  title: string;
  intro: string;
  /** `{threshold}` inside a section body is replaced with the live
   *  settings.freeShippingThreshold (rendered as $X) at display time. */
  sections: { title: string; content: string }[];
}

export interface FaqContent {
  eyebrow: string;
  title: string;
  intro: string;
  items: { q: string; a: string }[];
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  intro: string;
  cards: { icon: string; title: string; detail: string; sub: string }[];
  formTitle: string;
  /** Floating WhatsApp button texts (rendered on every SPA view). */
  chatBubble: string;
  chatTitle: string;
  chatStatus: string;
}

export interface FooterContent {
  blurb: string;
  navHeading: string;
  categoriesHeading: string;
  contactHeading: string;
  emailSub: string;
  hours: string;
  hoursSub: string;
  location: string;
  locationSub: string;
  /** Rendered after "© {year} ". */
  copyrightText: string;
  /** Small trust badges in the footer bottom bar. */
  badges: string[];
}

export interface CheckoutContent {
  eyebrow: string;
  title: string;
  /** HTML (keeps the highlighted "Send Order via WhatsApp" phrase). */
  introHtml: string;
  emptyTitle: string;
  emptyText: string;
  thankYouTitle: string;
  thankYouRefLabel: string;
  /** HTML (may contain the highlighted "Send" span). */
  thankYouTextWa: string;
  /** HTML; `{phone}` = the store WhatsApp number. */
  thankYouTextNoWa: string;
  sendButtonLabel: string;
  sendButtonSub: string;
  /**
   * WhatsApp order message template. Placeholders: {orderId} {items}
   * {subtotal} {shipping} {total} {name} {email} {phone} {address}
   * {payment} {notesLine} {siteName}.
   */
  whatsappTemplate: string;
}

export interface CategoryPageContent {
  key: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  eyebrow: string;
  /** "{count}" is replaced with the live product count. */
  intro: string;
  sectionOrder?: string[];
  sectionTitles?: Record<string, string>;
  sectionDescriptions?: Record<string, string>;
  heroImage: string;
  /** Hero pill texts; `{threshold}` = free-shipping threshold ($X). */
  heroPills: string[];
  exploreTitle: string;
  footerTagline: string;
}

export interface SeoContent {
  title: string;
  description: string;
  keywords: string[];
  /** schema.org paymentAccepted line (layout JSON-LD). */
  paymentAccepted: string;
  /** Long store description used in the layout JSON-LD. */
  storeDescription: string;
  /** Screen-reader H1 rendered by the storefront SPA header. */
  h1: string;
}

export interface BlogChrome {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  byline: string;
  bottomLineTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  faqTitle: string;
  relatedTitle: string;
}

/* ── Editorial (sets / guides / calendar) ── */

export interface SetsContent {
  hubs: Record<string, SetHub>;
  index: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: string;
  };
}

export interface GuidesContent {
  items: Record<string, Guide>;
  index: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: string;
  };
}

export interface CalendarContent {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  /** Headline/description used in the Article JSON-LD. */
  articleDescription: string;
  eyebrow: string;
  title: string;
  updatedLine: string;
  intro: string;
  upcomingTitle: string;
  recentTitle: string;
  upcoming: CalendarEntry[];
  recent: CalendarEntry[];
  ctaTitle: string;
  ctaText: string;
  faqs: { q: string; a: string }[];
  footnote: string;
}

/* ── Blog posts (mirrors the BlogPost shape in blog-data.ts) ── */

export interface BlogSectionData {
  h: string;
  paragraphs: string[];
  table?: { head: string[]; rows: string[][] };
  math?: string[];
  note?: string;
  checklist?: string[];
}

export interface BlogPostData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  datePublished: string;
  readMinutes: number;
  intro: string[];
  sections: BlogSectionData[];
  takeaway: string[];
  faqs: { q: string; a: string }[];
}

/* ── The whole editable site ── */

export interface SiteContent {
  settings: SiteSettings;
  heroSlides: StoreHeroSlide[];
  announcements: StoreAnnouncement[];
  home: HomeContent;
  about: AboutContent;
  shipping: ShippingContent;
  faq: FaqContent;
  contact: ContactContent;
  footer: FooterContent;
  checkout: CheckoutContent;
  sets: SetsContent;
  guides: GuidesContent;
  calendar: CalendarContent;
  categoryPages: Record<string, CategoryPageContent>;
  seo: SeoContent;
  blog: BlogChrome;
}

/** Content keys the SPA / client defaults carry (editorial keys are
 *  seeded server-side from content-data.ts — see site-content.ts). */
export type ClientSiteContent = Omit<SiteContent, "sets" | "guides" | "calendar">;
