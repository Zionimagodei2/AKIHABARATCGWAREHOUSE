"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { directSignUp, directSignIn, directCreateOrder, postToApi } from "@/lib/store-api";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Shield,
  Truck,
  Globe,
  Heart,
  Menu,
  ChevronUp,
  MapPin,
  Mail,
  Clock,
  CreditCard,
  RotateCcw,
  HelpCircle,
  ExternalLink,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ClientSiteContent,
  StoreHeroSlide,
  StoreAnnouncement,
} from "@/lib/content-types";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import { resolveSlideTarget } from "@/lib/hero-link";

/* ─────────── Types ─────────── */

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  image: string;
  description?: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  rating?: number;
  in_stock?: boolean;
  featured?: boolean;
  /** Manual display position set from the admin panel (lower = first). */
  sort_order?: number;
  slug?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type CurrencyCode = "USD" | "JPY" | "EUR" | "GBP";
type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating";
type PageView = "shop" | "about" | "shipping" | "faq" | "contact" | "signin" | "checkout";

/* ─────────── Product Image Component ─────────── */

function isLocalImage(src: string): boolean {
  return src.startsWith("/") || src.startsWith("data:");
}

function ProductImg({ src, alt, fill, className, sizes, priority, width, height }: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const [imgError, setImgError] = React.useState(false);

  const imgSrc = imgError ? "/images/existing/ONE.webp" : src;

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className || ""}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" } : { width: width || "100%", height: height || "100%", objectFit: "contain" }}
      onError={() => setImgError(true)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
    />
  );
}

/* ─────────── Constants ─────────── */

const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  JPY: 149.5,
  EUR: 0.92,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  JPY: "¥",
  EUR: "€",
  GBP: "£",
};

const CATEGORY_TABS = [
  { key: "all", label: "All Products" },
  { key: "Pokemon", label: "Pokémon", gradient: "from-red-500 to-orange-500", sectionGradient: "from-red-600/20 to-orange-500/20" },
  { key: "English One Piece", label: "English One Piece", gradient: "from-sky-500 to-blue-600", sectionGradient: "from-sky-500/20 to-blue-600/20" },
  { key: "Japanese One Piece", label: "Japanese One Piece", gradient: "from-yellow-500 to-amber-500", sectionGradient: "from-yellow-500/20 to-amber-500/20" },
  { key: "Other TCG", label: "Other Categories", gradient: "from-purple-500 to-indigo-500", sectionGradient: "from-purple-500/20 to-indigo-500/20" },
];

/* Known subcategory display order per category (unknown ones from the
   catalog are appended automatically — see buildSubcategoryTabs). */
const SUBCATEGORY_TABS: Record<string, { key: string; label: string }[]> = {
  "Pokemon": [
    { key: "Sealed Case", label: "Sealed Case" },
    { key: "Booster Boxes", label: "Booster Boxes" },
    { key: "Special Set & Promo", label: "Special Set & Promo" },
    { key: "Promo", label: "Promo" },
  ],
  "English One Piece": [
    { key: "Sealed Case", label: "Sealed Case" },
    { key: "Booster Boxes", label: "Booster Boxes" },
  ],
  "Japanese One Piece": [
    { key: "Sealed Case", label: "Sealed Case" },
    { key: "Booster Boxes", label: "Booster Boxes" },
    { key: "Special Set", label: "Special Set" },
  ],
  "Other TCG": [
    { key: "Weiss Schwarz", label: "Weiss Schwarz" },
    { key: "Union Arena", label: "Union Arena" },
    { key: "Dragon Ball", label: "Dragon Ball" },
    { key: "Gundam", label: "Gundam" },
    { key: "Lorcana", label: "Lorcana" },
    { key: "OSICA", label: "OSICA" },
    { key: "Lycee", label: "Lycee" },
  ],
};

/* ── Dynamic category navigation ──
   The tabs above are the base; categories the admin creates later
   (new products carrying an unseen `category`) appear automatically —
   inserted before "Other Categories" so it stays last. Subcategory
   tabs follow the catalog the same way. */
function buildCategoryTabs(products: Product[], loading = false): typeof CATEGORY_TABS {
  const known = CATEGORY_TABS.map((t) => t.key);
  const inCatalog = new Set<string>();
  for (const p of products) if (p.category && p.category !== "all") inCatalog.add(p.category);
  const fresh = [...inCatalog]
    .filter((c) => !known.includes(c))
    .sort((a, b) => a.localeCompare(b));
  // Before the catalog arrives (or if it failed to load) keep the default
  // tabs. Once loaded, a default tab whose category was renamed or deleted
  // from the admin panel is hidden so no empty tab lingers on the store.
  const keepDefaults = loading || products.length === 0;
  const base = keepDefaults
    ? CATEGORY_TABS
    : CATEGORY_TABS.filter((t) => t.key === "all" || inCatalog.has(t.key));
  return [
    base[0],
    ...base.filter((t) => t.key !== "all" && t.key !== "Other TCG"),
    ...fresh.map((c) => ({
      key: c,
      label: c,
      gradient: "from-teal-500 to-emerald-600",
      sectionGradient: "from-teal-500/20 to-emerald-600/20",
    })),
    ...(keepDefaults || inCatalog.has("Other TCG") ? [CATEGORY_TABS[CATEGORY_TABS.length - 1]] : []),
  ];
}

function buildSubcategoryTabs(category: string, products: Product[], loading = false): { key: string; label: string }[] {
  const known = SUBCATEGORY_TABS[category] || [];
  const knownKeys = known.map((s) => s.key.toLowerCase());
  const inCatalog = new Set<string>();
  for (const p of products) {
    if ((p.category || "") !== category) continue;
    const subs = p.categories && p.categories.length > 1 ? p.categories.slice(1) : p.subcategory ? [p.subcategory] : [];
    subs.forEach((s) => inCatalog.add(s));
  }
  const fresh = [...inCatalog]
    .filter((s) => !knownKeys.includes(s.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
  // Ghost-tab guard: while the catalog is loading (or failed to load) keep
  // the defaults; once loaded, a known subcategory with no products behind
  // it (renamed or deleted from the admin panel) is hidden instead of
  // lingering as an empty tab.
  const keepKnown = loading || products.length === 0;
  const visibleKnown = keepKnown
    ? known
    : known.filter((s) => [...inCatalog].some((c) => c.toLowerCase() === s.key.toLowerCase()));
  return [...visibleKnown, ...fresh.map((s) => ({ key: s, label: s }))];
}

const HERO_SLIDES = [
  {
    image: "/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.webp",
    title: "Japanese Pokémon TCG",
    subtitle: "Direct from Akihabara — Authentic & Sealed",
    accent: "New Arrivals",
  },
  {
    image: "/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp",
    title: "VSTAR Universe",
    subtitle: "Rare pulls & exclusive artwork from Japan",
    accent: "Limited Stock",
  },
  {
    image: "/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp",
    title: "Ruler of the Black Flame",
    subtitle: "Charizard ex & more — Sealed Booster Boxes",
    accent: "Hot",
  },
  {
    image: "/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.webp",
    title: "Snow Hazard Collection",
    subtitle: "Complete your Japanese set before they're gone",
    accent: "Sale",
  },
];

const ANNOUNCEMENT_MESSAGES = [
  "Free Shipping on Orders Over $500",
  "Direct from Japan — 100% Authentic Sealed Products",
  "Ships Worldwide — Secure Packaging Guaranteed",
  "Trusted by Thousands of Collectors Worldwide",
  "Guaranteed Authenticity on Every Item We Sell",
];

/* ─────────── Helpers ─────────── */

function formatPrice(usdPrice: number, currency: CurrencyCode): string {
  if (!usdPrice || usdPrice <= 0) return `${CURRENCY_SYMBOLS[currency]}0.00`;
  const converted = usdPrice * ACTIVE_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === "JPY") {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}

/* Exchange rates start at the compiled defaults and are replaced by
   the published settings rates when /api/site-content loads. */
let ACTIVE_RATES: Record<CurrencyCode, number> = { ...CURRENCY_RATES };

/* Icons the content editors can pick for cards/badges (by name). */
const CONTENT_ICONS: Record<string, typeof Shield> = {
  Shield,
  Truck,
  Globe,
  Package,
  Heart,
  Star,
  Mail,
  Clock,
  MapPin,
};

/* `{threshold}` in editable prose = the free-shipping threshold,
   rendered as a USD amount exactly like the site always showed it. */
function fillThreshold(text: string, threshold: number): string {
  return text.split("{threshold}").join(`$${threshold}`);
}

/* Merge a partial content payload over the compiled defaults
   (per top-level key, shallow inside each key). */
function mergeClientContent(data: unknown): ClientSiteContent {
  if (!data || typeof data !== "object") return DEFAULT_CONTENT;
  const d = data as Record<string, unknown>;
  const out: Record<string, unknown> = { ...DEFAULT_CONTENT };
  for (const key of Object.keys(DEFAULT_CONTENT)) {
    const v = d[key];
    if (v === undefined || v === null) continue;
    const def = (DEFAULT_CONTENT as unknown as Record<string, unknown>)[key];
    out[key] =
      Array.isArray(def) ||
      typeof def !== "object" ||
      typeof v !== "object" ||
      Array.isArray(v)
        ? v
        : { ...(def as object), ...(v as object) };
  }
  return out as unknown as ClientSiteContent;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />);
    } else if (i === full && hasHalf) {
      stars.push(
        <div key={i} className="relative">
          <Star className="size-3.5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="size-3.5 text-gray-300" />);
    }
  }
  return stars;
}

function getDiscountPercent(original: number, sale: number): number {
  if (!original || original <= 0) return 0;
  if (!sale || sale <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/* ─────────── Main Component ─────────── */

export default function TCGStore({
  initialProducts,
  initialTotal,
}: {
  initialProducts?: Product[];
  /** Full catalog size; when the SSR preview is smaller, the client
      hydrates the rest from /products.json after mount. */
  initialTotal?: number;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);
  // Render the SSR preview in the initial HTML (SEO: first page of the
  // catalog is present for crawlers; the client hydrates the rest from
  // /products.json. Product images lazy-load so the page stays fast.)
  const [visibleCount, setVisibleCount] = useState(() =>
    initialProducts && initialProducts.length > 0 ? initialProducts.length : 12
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  // Open category dropdown in the header / open category accordion in the footer
  const [openCatDropdown, setOpenCatDropdown] = useState<string | null>(null);
  const [openFooterCat, setOpenFooterCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageView>("shop");
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  // Site content — every editorial string on the storefront, editable
  // from the admin panel and served published from /api/site-content.
  // Starts as the compiled defaults (identical to the current live
  // text) so the first paint never flashes or waits.
  const [siteContent, setSiteContent] = useState<ClientSiteContent>(DEFAULT_CONTENT);

  // Group products by category for homepage 2-per-category display
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    for (const p of products) {
      const cat = p.category || "Other TCG";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    }
    return groups;
  }, [products]);

  // (Tawk.to live chat now loads globally from the root layout — see
  // src/components/tawk-chat.tsx — so the widget is present on every page,
  // not only the storefront, and starts loading alongside the page render.)

  // Set mounted flag to prevent hydration mismatches with Radix components
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load the published site content. Falls back to /content.json
  // (legacy subset) and finally to the compiled defaults.
  useEffect(() => {
    let cancelled = false;
    const applyRates = (settings: ClientSiteContent["settings"]) => {
      const jpy = parseFloat(settings.currencyJPY);
      const eur = parseFloat(settings.currencyEUR);
      const gbp = parseFloat(settings.currencyGBP);
      ACTIVE_RATES = {
        USD: 1,
        JPY: Number.isFinite(jpy) && jpy > 0 ? jpy : CURRENCY_RATES.JPY,
        EUR: Number.isFinite(eur) && eur > 0 ? eur : CURRENCY_RATES.EUR,
        GBP: Number.isFinite(gbp) && gbp > 0 ? gbp : CURRENCY_RATES.GBP,
      };
    };
    fetch("/api/site-content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") throw new Error("no site content");
        const merged = mergeClientContent(data);
        setSiteContent(merged);
        applyRates(merged.settings);
      })
      .catch(() =>
        fetch(`/content.json?_ts=${Date.now()}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (cancelled || !data || typeof data !== "object") return;
            const merged = mergeClientContent({
              heroSlides: data.heroSlides,
              announcements: data.announcements,
              settings: data.settings,
            });
            setSiteContent(merged);
            applyRates(merged.settings);
          })
          .catch(() => {}),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const settings = siteContent.settings;
  const freeShippingThreshold = Number(settings.freeShippingThreshold) || 500;
  const standardShippingFee = Number(settings.standardShippingFee) || 15;

  // Active hero slides / announcements / whatsapp (published content first)
  const heroSlides = React.useMemo(() => {
    const slides = (siteContent.heroSlides || [])
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((s) => ({ image: s.image, title: s.title, subtitle: s.subtitle, accent: s.accent, productId: s.productId ?? null }));
    return slides.length > 0 ? slides : HERO_SLIDES.map((s) => ({ ...s, productId: null }));
  }, [siteContent]);

  // Dynamic category tabs — categories created from the admin panel appear
  // here automatically (inserted before "Other Categories"); categories
  // renamed or deleted from the admin panel disappear once the catalog loads.
  const categoryTabs = React.useMemo(() => buildCategoryTabs(products, loading), [products, loading]);

  const announcementMessages = React.useMemo(() => {
    const msgs = (siteContent.announcements || [])
      .filter((a) => a.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((a) => a.message);
    return msgs.length > 0 ? msgs : ANNOUNCEMENT_MESSAGES;
  }, [siteContent]);

  const whatsappNumber = settings.whatsappNumber || "+81 80-2935-0455";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`;

  // WhatsApp nudge bubble: appears a few seconds after landing, fades away,
  // then re-appears periodically — calls attention to the chat button.
  const [showWaBubble, setShowWaBubble] = React.useState(false);
  useEffect(() => {
    let showT: ReturnType<typeof setTimeout>;
    let hideT: ReturnType<typeof setTimeout>;
    const cycle = () => {
      showT = setTimeout(() => {
        setShowWaBubble(true);
        hideT = setTimeout(() => setShowWaBubble(false), 7000);
      }, 4500);
    };
    cycle();
    const loopT = setInterval(cycle, 40000);
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
      clearInterval(loopT);
    };
  }, []);

  // Product page handoff: /?product=<id> opens that product's modal so the
  // "Add to Cart" CTA on /product/[slug] lands the user in the purchase flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    if (!productId) return;
    const target = products.find((p) => p.id === productId);
    if (target) {
      setSelectedProduct(target);
      setProductModalOpen(true);
      // Clean the URL so refreshes don't re-open the modal
      window.history.replaceState({}, "", "/");
    }
  }, [products]);

  // Restore user session on mount
  useEffect(() => {
    const stored = localStorage.getItem("aki_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("aki_user");
      }
    }
  }, []);

  // Fetch products from API (database-backed), then static JSON fallback.
  // Skipped only when the server already rendered the FULL catalog.
  // When the server rendered just a preview page (SEO: small initial HTML),
  // the client hydrates the rest from /products.json after mount.
  useEffect(() => {
    const initial = initialProducts || [];
    if (initialTotal && initial.length >= initialTotal) return;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const cleaned = (data.products || [])
            .filter((p: Product) => p.id && p.title && p.price > 0 && p.image && p.category)
            .map((p: Product) => ({
              ...p,
              subcategory: p.categories && p.categories.length > 1 ? p.categories[1] : undefined,
              description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed. Order ${p.title} directly from Japan at unbeatable prices.`,
            }));
          setProducts((prev) => (cleaned.length > prev.length ? cleaned : prev));
          setLoading(false);
          return;
        }
      } catch {
        // API failed — fall through to static JSON
      }

      // Fallback: load from static products.json
      try {
        const res = await fetch("/products.json");
        const data: Product[] = await res.json();
        const cleaned = data
          .filter((p) => p.id && p.title && p.price > 0 && p.image && p.category)
          .map((p) => ({
            ...p,
            subcategory: p.categories && p.categories.length > 1 ? p.categories[1] : undefined,
            description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed. Order ${p.title} directly from Japan at unbeatable prices.`,
          }));
        // Only swap in the fetched catalog when it's fuller than the SSR
        // preview — never downgrade to a smaller/failed payload.
        setProducts((prev) => (cleaned.length > prev.length ? cleaned : prev));
      } catch {
        // Silent fail — keep the SSR preview
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Hero carousel auto-play (re-arms when the editable slide set changes)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.max(heroSlides.length, 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  // Keep hero index valid when the slide set shrinks
  useEffect(() => {
    if (heroIndex >= heroSlides.length) setHeroIndex(0);
  }, [heroSlides, heroIndex]);

  // Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          (p.categories && p.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) ||
          (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    if (selectedSubcategory !== "all" && selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          (p.categories && p.categories.length > 1 && p.categories.slice(1).some((c) => c.toLowerCase() === selectedSubcategory.toLowerCase())) ||
          (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }
    // Custom sort: priority by subcategory, then series prefix, then numerical order
    const getCategoryPriority = (p: Product): number => {
      const cats = p.categories || [];
      const sub = p.subcategory || (cats.length > 1 ? cats[1] : "");
      const subLower = sub.toLowerCase();
      if (subLower === "sealed case") return 0;
      if (subLower === "booster boxes") return 1;
      if (subLower.includes("special")) return 2;
      if (subLower === "promo") return 3;
      return 4;
    };

    // Series prefix priority: OP first, then EB, then PRB, then others
    const getSeriesPriority = (p: Product): number => {
      const title = p.title.toUpperCase();
      if (title.match(/^OP[-\s]?\d/i)) return 0;       // OP series first
      if (title.match(/^EB[-\s]?\d/i)) return 1;       // EB series second
      if (title.match(/^PRB[-\s]?\d/i)) return 2;      // PRB series third
      if (title.match(/^ST[-\s]?\d/i)) return 3;       // ST series
      if (title.match(/^SV[-\s]?\d/i)) return 4;       // SV series
      if (title.match(/^PR[-\s]?\d/i)) return 5;       // PR series
      return 9;                                          // Others last
    };

    // Extract series number from title (e.g., "OP-14" → 14, "EB-04" → 4)
    const getSeriesNumber = (p: Product): number => {
      const match = p.title.match(/(?:OP|EB|PRB|ST|SV|PR)[-\s]?(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    };

    switch (sortOption) {
      case "price-asc": filtered = [...filtered].sort((a, b) => a.price - b.price); break;
      case "price-desc": filtered = [...filtered].sort((a, b) => b.price - a.price); break;
      case "name-asc": filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "name-desc": filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title)); break;
      case "rating": filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default:
        // Featured/default: manual position (sort_order, set from the
        // admin panel) first, then admin-featured products, category
        // priority, series prefix, series number (descending), then rating
        filtered = [...filtered].sort((a, b) => {
          const oa = typeof a.sort_order === "number" ? a.sort_order : Number.MAX_SAFE_INTEGER;
          const ob = typeof b.sort_order === "number" ? b.sort_order : Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;              // Manual position first
          const fa = a.featured === true ? 0 : 1;
          const fb = b.featured === true ? 0 : 1;
          if (fa !== fb) return fa - fb;
          const pa = getCategoryPriority(a);
          const pb = getCategoryPriority(b);
          if (pa !== pb) return pa - pb;
          const sa = getSeriesPriority(a);
          const sb = getSeriesPriority(b);
          if (sa !== sb) return sa - sb;           // OP before EB before PRB
          const na = getSeriesNumber(a);
          const nb = getSeriesNumber(b);
          if (na !== nb) return nb - na;            // Higher numbers first (OP-17 before OP-16)
          return (b.rating ?? 0) - (a.rating ?? 0);
        });
        break;
    }
    return filtered;
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortOption]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item
      ).filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const openProductModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const navigateTo = useCallback((page: PageView) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  /* Shared helper: switch the shop to a category (+optional subcategory)
     and smooth-scroll to the products grid. */
  const goToProducts = useCallback((catKey: string, subKey: string) => {
    setSelectedCategory(catKey);
    setSelectedSubcategory(subKey);
    setMobileMenuOpen(false);
    setOpenCatDropdown(null);
    const scrollToProducts = () => {
      const el = document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    if (currentPage !== "shop") {
      navigateTo("shop");
      setTimeout(scrollToProducts, 120);
    } else {
      scrollToProducts();
    }
  }, [currentPage, navigateTo]);

  /* Category pill click = open/close the subcategory menu only — the visitor
     always gets the chance to choose a subcategory (or "All {Category}") from
     the menu before any navigation happens. Toggle works for both
     hover-capable pointers (click again to dismiss) and touch (tap to open,
     tap to close). */
  const handleCategoryNav = useCallback((key: string) => {
    setOpenCatDropdown((prev) => (prev === key ? null : key));
  }, []);

  /* Subcategory selection from the header dropdown or the footer accordion. */
  const handleSubcategoryNav = useCallback((catKey: string, subKey: string) => {
    goToProducts(catKey, subKey);
  }, [goToProducts]);

  // Close the header dropdown on outside click / Escape
  useEffect(() => {
    if (!openCatDropdown) return;
    const onDoc = (e: MouseEvent) => {
      const bar = document.getElementById("header-category-bar");
      if (bar && !bar.contains(e.target as Node)) setOpenCatDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCatDropdown(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCatDropdown]);

  /* ─────────── Render ─────────── */

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900 noise-overlay overflow-x-hidden" style={{background: "linear-gradient(to bottom right, #581c87, #6d28d9, #581c87)"}}>
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb-1 absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/40 blur-3xl"></div>
        <div className="orb-2 absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-violet-500/30 blur-3xl"></div>
        <div className="orb-1 absolute -bottom-48 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-400/30 blur-3xl"></div>
      </div>

      {/* ─── Announcement Bar ─── */}
      <div className="bg-purple-950 text-white overflow-hidden relative">
        <div className="animate-marquee flex whitespace-nowrap py-2.5">
          {[...announcementMessages, ...announcementMessages].map((msg, i) => (
            <span key={i} aria-hidden={i >= announcementMessages.length} className="mx-10 text-[14px] font-light tracking-wide opacity-90">
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 glass-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <button onClick={() => navigateTo("shop")} aria-label="Akihabara TCG Warehouse — home" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-opacity shrink-0">
                <img src="/store-logo.webp" alt="Akihabara TCG Warehouse logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-[17px] font-extrabold font-[family-name:var(--font-montserrat)] text-purple-900 leading-none tracking-tight">
                  AKIHABARA
                </span>
                <span className="block text-[9px] font-bold text-violet-400 tracking-[0.25em] uppercase leading-none mt-0.5">
                  TCG Warehouse
                </span>
              </div>
            </button>

            {/* SEO h1 — describes the page for search engines and screen readers */}
            <h1 className="sr-only">
              {siteContent.seo.h1}
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Shop", page: "shop" as PageView },
                { label: "About", page: "about" as PageView },
                { label: "Shipping", page: "shipping" as PageView },
                { label: "FAQ", page: "faq" as PageView },
                { label: "Contact", page: "contact" as PageView },
                { label: currentUser ? (currentUser.name || currentUser.email) : "Sign In", page: currentUser ? "shop" as PageView : "signin" as PageView },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigateTo(item.page)}
                  className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                    currentPage === item.page
                      ? "text-purple-900 bg-gray-50"
                      : "text-gray-500 hover:text-purple-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {/* Editorial routes — real links so crawlers follow them */}
              <Link
                href="/sets/"
                className="px-3 py-2 text-[13px] font-medium rounded-md transition-colors text-gray-500 hover:text-purple-900 hover:bg-gray-50"
              >
                Set Guides
              </Link>
              <Link
                href="/release-calendar/"
                className="px-3 py-2 text-[13px] font-medium rounded-md transition-colors text-gray-500 hover:text-purple-900 hover:bg-gray-50"
              >
                Releases
              </Link>
              <Link
                href="/blog/"
                className="px-3 py-2 text-[13px] font-medium rounded-md transition-colors text-gray-500 hover:text-purple-900 hover:bg-gray-50"
              >
                Blog
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">

              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (currentPage !== "shop") navigateTo("shop"); }}
                  className="pl-9 w-40 lg:w-56 h-9 text-[13px] bg-gray-50 border-gray-200 focus:border-purple-900 focus:ring-purple-900/10"
                />
              </div>

              <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => {
                const el = document.getElementById("mobile-search");
                if (el) el.classList.toggle("hidden");
              }}>
                <Search className="size-5" />
              </Button>

              {mounted ? (
                <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger className="w-[72px] h-9 text-[11px] font-bold border-gray-200 bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="JPY">JPY ¥</SelectItem>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="GBP">GBP £</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-[72px] h-9 text-[11px] font-bold border border-gray-200 bg-gray-50 rounded-md flex items-center justify-center">
                  USD $
                </div>
              )}

              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)} aria-label="Open shopping cart">
                <ShoppingCart className="size-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#cb2027] text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {/* ── Category bar (categories moved from the products section into the header) ──
              Mobile: main categories in ONE horizontally-scrollable row —
              subcategories stay hidden until a category is tapped. Desktop:
              pills wrap onto multiple lines as before. */}
          <div id="header-category-bar" className="border-t border-purple-100/70 bg-white/70">
            <div className="relative">
            <div className="flex items-center gap-1.5 py-2 px-1 flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-x-visible">
              <span className="hidden lg:inline-flex items-center pr-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400 shrink-0 select-none">
                Categories
              </span>
              {categoryTabs.map((tab) => {
                const subs = buildSubcategoryTabs(tab.key, products, loading);
                const hasDropdown = !!subs && subs.length > 0;
                const isDropdownOpen = openCatDropdown === tab.key;
                const isActive = currentPage === "shop" && selectedCategory === tab.key;
                const isLast = tab.key === categoryTabs[categoryTabs.length - 1].key;

                if (!hasDropdown) {
                  return (
                    <button
                      key={tab.key}
                      onClick={() => { setOpenCatDropdown(null); goToProducts(tab.key, "all"); }}
                      aria-pressed={isActive}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                        isActive
                          ? "bg-purple-950 text-white shadow-md border-purple-950"
                          : "bg-purple-50/80 text-gray-600 hover:bg-purple-100 hover:text-purple-900 border-purple-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                }

                return (
                  <div
                    key={tab.key}
                    className="relative shrink-0"
                    onMouseEnter={() => {
                      // Desktop hover opens; touch devices use the tap below
                      if (typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches) {
                        setOpenCatDropdown(tab.key);
                      }
                    }}
                    onMouseLeave={() => {
                      if (typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches) {
                        setOpenCatDropdown((prev) => (prev === tab.key ? null : prev));
                      }
                    }}
                  >
                    <button
                      onClick={() => handleCategoryNav(tab.key)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="menu"
                      aria-pressed={isActive}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 border ${
                        isActive
                          ? "bg-purple-950 text-white shadow-md border-purple-950"
                          : "bg-purple-50/80 text-gray-600 hover:bg-purple-100 hover:text-purple-900 border-purple-100"
                      }`}
                    >
                      {tab.label}
                      <ChevronDown className={`size-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isDropdownOpen && (
                      <div
                        role="menu"
                        className={`hidden md:block absolute top-full ${isLast ? "right-0" : "left-0"} mt-1.5 w-56 bg-white rounded-xl shadow-xl shadow-purple-900/10 border border-purple-100 py-1.5 z-50`}
                      >
                        <button
                          role="menuitem"
                          onClick={() => handleSubcategoryNav(tab.key, "all")}
                          className={`block w-full text-left px-4 py-2 text-[12px] font-semibold transition-colors ${
                            selectedSubcategory === "all"
                              ? "text-purple-900 bg-purple-50"
                              : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                          }`}
                        >
                          All {tab.label}
                        </button>
                        <div className="h-px bg-purple-100 my-1" />
                        {subs!.map((sub) => (
                          <button
                            key={sub.key}
                            role="menuitem"
                            onClick={() => handleSubcategoryNav(tab.key, sub.key)}
                            className={`block w-full text-left px-4 py-2 text-[12px] transition-colors ${
                              currentPage === "shop" && selectedSubcategory === sub.key
                                ? "text-purple-900 bg-purple-50 font-semibold"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-900"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Mobile scroll affordance — soft fade hinting the row continues */}
            <div aria-hidden="true" className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/70 to-transparent" />
            </div>

            {/* Mobile (<md): subcategories expand IN-FLOW below the pills row
                as a wrapping pill panel — always inside the viewport, never an
                absolutely-positioned card sliding off the screen edge. */}
            {openCatDropdown && buildSubcategoryTabs(openCatDropdown, products, loading).length > 0 && (
              <div className="md:hidden flex flex-wrap gap-1.5 px-1 pt-2 pb-2.5 border-t border-purple-100/60">
                <button
                  onClick={() => handleSubcategoryNav(openCatDropdown, "all")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all duration-200 ${
                    currentPage === "shop" && selectedCategory === openCatDropdown && selectedSubcategory === "all"
                      ? "bg-violet-500 text-white border-violet-500"
                      : "bg-white/80 text-gray-600 hover:bg-purple-100 hover:text-purple-900 border-purple-100"
                  }`}
                >
                  All {categoryTabs.find((t) => t.key === openCatDropdown)?.label}
                </button>
                {buildSubcategoryTabs(openCatDropdown, products, loading).map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => handleSubcategoryNav(openCatDropdown, sub.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all duration-200 ${
                      currentPage === "shop" && selectedCategory === openCatDropdown && selectedSubcategory === sub.key
                        ? "bg-violet-500 text-white border-violet-500"
                        : "bg-white/80 text-gray-600 hover:bg-purple-100 hover:text-purple-900 border-purple-100"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile search bar */}
          <div id="mobile-search" className="hidden sm:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (currentPage !== "shop") navigateTo("shop"); }}
                className="pl-9 w-full h-9 text-[13px] bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Mobile nav menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden border-t border-gray-100"
              >
                <div className="py-2 space-y-0.5">
                  {[
                    { label: "Shop", page: "shop" as PageView },
                    { label: "About", page: "about" as PageView },
                    { label: "Shipping", page: "shipping" as PageView },
                    { label: "FAQ", page: "faq" as PageView },
                    { label: "Contact", page: "contact" as PageView },
                    { label: currentUser ? (currentUser.name || currentUser.email) : "Sign In", page: currentUser ? "shop" as PageView : "signin" as PageView },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => navigateTo(item.page)}
                      className={`block w-full text-left px-3 py-2.5 text-[13px] font-medium rounded-md transition-colors ${
                        currentPage === item.page
                          ? "text-purple-900 bg-gray-50"
                          : "text-gray-500 hover:text-purple-900 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        {currentPage === "shop" && <ShopPage products={products} loading={loading} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} searchQuery={searchQuery} sortOption={sortOption} setSortOption={setSortOption} currency={currency} filteredProducts={filteredProducts} openProductModal={openProductModal} addToCart={addToCart} heroIndex={heroIndex} setHeroIndex={setHeroIndex} scrollToSection={scrollToSection} productsByCategory={productsByCategory} visibleCount={visibleCount} setVisibleCount={setVisibleCount} heroSlides={heroSlides} content={siteContent.home} freeShippingThreshold={freeShippingThreshold} />}
        {currentPage === "about" && <AboutPage content={siteContent.about} />}
        {currentPage === "shipping" && <ShippingPage content={siteContent.shipping} freeShippingThreshold={freeShippingThreshold} />}
        {currentPage === "faq" && <FAQPage content={siteContent.faq} />}
        {currentPage === "contact" && <ContactPage content={siteContent.contact} storeEmail={settings.storeEmail} />}
        {currentPage === "signin" && <SignInPage onSignIn={(user) => { setCurrentUser(user); localStorage.setItem("aki_user", JSON.stringify(user)); navigateTo("shop"); }} freeShippingThreshold={freeShippingThreshold} />}
        {currentPage === "checkout" && <CheckoutPage cart={cart} cartTotal={cartTotal} currency={currency} navigateTo={navigateTo} clearCart={clearCart} whatsappLink={whatsappLink} content={siteContent.checkout} settings={settings} />}
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-gradient-to-r from-purple-950 via-violet-900 to-purple-950 mt-auto relative overflow-hidden" style={{background: "linear-gradient(to right, #3b0764, #4c1d95, #3b0764)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/store-logo.webp" alt="Akihabara TCG Warehouse" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold font-[family-name:var(--font-montserrat)] text-white text-[15px] leading-none">
                    AKIHABARA
                  </h3>
                  <p className="text-[8px] font-bold text-violet-300 tracking-[0.25em] uppercase leading-none mt-0.5">
                    TCG Warehouse
                  </p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-gray-300 mb-5 max-w-xs">
                {siteContent.footer.blurb}
              </p>

            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                {siteContent.footer.navHeading}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Shop All Products", page: "shop" as PageView },
                  { label: "About Us", page: "about" as PageView },
                  { label: "Shipping Policy", page: "shipping" as PageView },
                  { label: "FAQ", page: "faq" as PageView },
                  { label: "Contact Us", page: "contact" as PageView },
                  { label: currentUser ? `Hi, ${currentUser.name || currentUser.email}` : "Sign In / Sign Up", page: currentUser ? "shop" as PageView : "signin" as PageView },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigateTo(link.page)}
                      className="text-[13px] text-gray-300 hover:text-violet-300 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                {[
                  { label: "Set Guides", href: "/sets/" },
                  { label: "Buying Guides", href: "/guides/" },
                  { label: "Release Calendar", href: "/release-calendar/" },
                  { label: "Blog", href: "/blog/" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-gray-300 hover:text-violet-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Categories — tap a category to reveal its subcategories.
                The "View all" SEO links stay in the DOM (class-toggled, not
                conditionally rendered) so they remain crawlable. */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                {siteContent.footer.categoriesHeading}
              </h4>
              <ul className="space-y-1.5">
                {[
                  { key: "Pokemon", label: "Japanese Pokémon Cards", short: "Pokémon", href: "/pokemon-cards" },
                  { key: "English One Piece", label: "English One Piece Cards", short: "English One Piece", href: "/english-one-piece-cards" },
                  { key: "Japanese One Piece", label: "Japanese One Piece Cards", short: "Japanese One Piece", href: "/one-piece-cards" },
                  { key: "Other TCG", label: "Weiss Schwarz, Union Arena & More", short: "Other TCG", href: "/japanese-tcg" },
                ].map((cat) => {
                  const subs = buildSubcategoryTabs(cat.key, products, loading);
                  const isFooterOpen = openFooterCat === cat.key;
                  return (
                    <li key={cat.key}>
                      <button
                        onClick={() => setOpenFooterCat(isFooterOpen ? null : cat.key)}
                        aria-expanded={isFooterOpen}
                        className="flex w-full items-center justify-between gap-2 text-left text-[13px] text-gray-300 hover:text-violet-300 transition-colors py-1"
                      >
                        <span>{cat.label}</span>
                        <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${isFooterOpen ? "rotate-180" : ""}`} />
                      </button>
                      {/* Always rendered; visually toggled to keep links crawlable */}
                      <div className={`${isFooterOpen ? "block" : "hidden"} mt-1 mb-2 ml-3 border-l border-purple-400/30 pl-3 space-y-1.5`}>
                        <Link
                          href={cat.href}
                          className="block text-[12px] font-semibold text-violet-300 hover:text-violet-200 transition-colors"
                        >
                          View all {cat.short} →
                        </Link>
                        {subs.map((sub) => (
                          <button
                            key={sub.key}
                            onClick={() => handleSubcategoryNav(cat.key, sub.key)}
                            className="block w-full text-left text-[12px] text-gray-400 hover:text-violet-300 transition-colors"
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                {siteContent.footer.contactHeading}
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">{settings.storeEmail}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{siteContent.footer.emailSub}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">{siteContent.footer.hours}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{siteContent.footer.hoursSub}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">{siteContent.footer.location}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{siteContent.footer.locationSub}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-gray-300">
                &copy; {new Date().getFullYear()} {siteContent.footer.copyrightText}
              </p>
              <div className="flex items-center gap-4">
                {siteContent.footer.badges.map((badge, i) => {
                  const BadgeIcon = [Shield, CreditCard, RotateCcw][i % 3];
                  return (
                    <div key={badge} className="flex items-center gap-2 text-[11px] text-gray-300">
                      <BadgeIcon className="size-3.5" />
                      <span>{badge}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 bg-purple-950 hover:bg-violet-500 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Contact — prominent, animated */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 17 }}
        className="fixed left-3 sm:left-5 z-[999]"
        style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Periodic nudge bubble above the button */}
        <AnimatePresence>
          {showWaBubble && (
            <motion.div
              key="wa-bubble"
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="absolute bottom-full left-0 mb-3 whitespace-nowrap rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
            >
              <span className="text-[12.5px] font-bold text-purple-950">
                {siteContent.contact.chatBubble}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sonar rings */}
        <span
          aria-hidden="true"
          className="wa-ring pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366]"
        />
        <span
          aria-hidden="true"
          className="wa-ring wa-ring-delay pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366]"
        />

        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className="wa-breathe relative flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[#2fe671] to-[#20bd5a] px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_10px_34px_rgba(37,211,102,0.55),0_3px_10px_rgba(0,0,0,0.25)] ring-2 ring-white/70"
          aria-label="Chat with us on WhatsApp"
        >
          <span className="wa-wiggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[14px] sm:text-[15px] font-extrabold tracking-wide text-white drop-shadow-sm">
              {siteContent.contact.chatTitle}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-white/90">
              <span className="wa-dot inline-block size-1.5 rounded-full bg-emerald-100" />
              {siteContent.contact.chatStatus}
            </span>
          </span>
        </motion.a>
      </motion.div>

      {/* Cart Sidebar */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-white p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[15px]">
              <ShoppingCart className="size-5" />
              Your Cart
              {cartItemCount > 0 && (
                <Badge className="bg-purple-950 text-white border-0 text-[10px] font-bold">{cartItemCount}</Badge>
              )}
            </SheetTitle>
            <SheetDescription className="text-[12px] text-gray-500">
              {cart.length === 0 ? "Your cart is empty" : `${cartItemCount} item${cartItemCount > 1 ? "s" : ""}`}
            </SheetDescription>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="size-14 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium text-[14px]">No items yet</p>
              <p className="text-[12px] text-gray-400 mt-1">Add some products to get started</p>
              <Button className="mt-4 bg-purple-950 hover:bg-purple-800 text-white text-[13px]" onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="w-14 h-18 rounded-md overflow-hidden shrink-0 bg-gray-200">
                        <ProductImg src={item.product.image} alt={item.product.title} width={56} height={72} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-purple-900 truncate">{item.product.title}</p>
                        <p className="text-[13px] font-bold text-purple-900 mt-1">{formatPrice(item.product.price, currency)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="size-7" onClick={() => updateCartQuantity(item.product.id, -1)}>
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-[12px] font-semibold w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="size-7" onClick={() => updateCartQuantity(item.product.id, 1)}>
                            <Plus className="size-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 ml-auto text-[#cb2027] hover:text-[#cb2027] hover:bg-[#cb2027]/10" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-purple-900">{formatPrice(cartTotal, currency)}</span>
                </div>
                {cartTotal < freeShippingThreshold && (
                  <p className="text-[11px] text-gray-400 text-center">
                    Add {formatPrice(freeShippingThreshold - cartTotal, currency)} more for free shipping
                  </p>
                )}
                {cartTotal >= freeShippingThreshold && (
                  <p className="text-[11px] text-green-600 text-center font-medium">
                    You qualify for free shipping!
                  </p>
                )}
                <Button className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]" onClick={() => { setCartOpen(false); navigateTo("checkout"); }}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full text-[13px]" onClick={() => setCartOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Product Details</DialogTitle>
          <DialogDescription className="sr-only">Detailed view of the selected product</DialogDescription>
          {selectedProduct && (
            <ProductDetailModal product={selectedProduct} currency={currency} onClose={() => setProductModalOpen(false)} onAddToCart={addToCart} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────── Shop Page ─────────── */

function ShopPage({ products, loading, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, searchQuery, sortOption, setSortOption, currency, filteredProducts, openProductModal, addToCart, heroIndex, setHeroIndex, scrollToSection, productsByCategory, visibleCount, setVisibleCount, heroSlides, content, freeShippingThreshold }: {
  products: Product[]; loading: boolean; selectedCategory: string; setSelectedCategory: (v: string) => void;
  selectedSubcategory: string; setSelectedSubcategory: (v: string) => void;
  searchQuery: string; sortOption: SortOption; setSortOption: (v: SortOption) => void;
  currency: CurrencyCode; filteredProducts: Product[];
  openProductModal: (p: Product) => void; addToCart: (p: Product) => void;
  heroIndex: number; setHeroIndex: (v: number | ((prev: number) => number)) => void;
  scrollToSection: (id: string) => void;
  productsByCategory: Record<string, Product[]>;
  visibleCount: number; setVisibleCount: (v: number | ((prev: number) => number)) => void;
  heroSlides: { image: string; title: string; subtitle: string; accent: string; productId?: string | null }[];
  content: ClientSiteContent["home"];
  freeShippingThreshold: number;
}) {
  // Determine if we show the homepage category showcase or the full product grid
  const isHomepageView = selectedCategory === "all" && !searchQuery.trim();

  // Dynamic tabs (admin-created categories/subcategories appear automatically;
  // renamed/deleted default categories disappear once the catalog is loaded)
  const categoryTabs = buildCategoryTabs(products, loading);
  // Category display order
  const categoryOrder = categoryTabs.filter(t => t.key !== "all").map(t => t.key);

  // Where "Shop Now" takes the customer for the slide on screen:
  // linked product page → product detail page; else matching category →
  // category view; else the classic scroll to the products grid. Fully
  // automatic — re-resolved on every render against the live catalog.
  const heroTarget = heroSlides[heroIndex]
    ? resolveSlideTarget(heroSlides[heroIndex], products)
    : null;
  const handleShopNow = () => {
    if (heroTarget?.kind === "product") {
      window.location.href = `/product/${heroTarget.slug}`;
      return;
    }
    if (heroTarget?.kind === "category") {
      setSelectedCategory(heroTarget.category);
      setSelectedSubcategory(heroTarget.subcategory || "all");
      scrollToSection("products");
      return;
    }
    scrollToSection("products");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1a1033] via-[#2d1f4e] to-[#1a1033]" style={{background: "linear-gradient(to right, #1a1033, #2d1f4e, #1a1033)"}}>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_8s_ease-in-out_infinite]" style={{background: "linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)", transform:"skewX(-20deg)", width:"200%"}}></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative h-64 sm:h-80 lg:h-[420px] w-full"
              >
                <ProductImg src={heroSlides[heroIndex].image} alt={heroSlides[heroIndex].title} fill className="object-cover" priority={heroIndex === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-900/60 to-transparent" style={{background: "linear-gradient(to right, rgba(59,7,100,0.9), rgba(88,28,135,0.6), transparent)"}} />
                <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                  <div className="max-w-lg">
                    <p className="mb-3 text-[13px] font-bold text-white tracking-[0.2em] uppercase">
                      {heroSlides[heroIndex].accent}
                    </p>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-[1.1] mb-4">
                      {heroSlides[heroIndex].title}
                    </h2>
                    <p className="text-[14px] sm:text-[16px] text-gray-200 mb-6 max-w-md leading-relaxed">
                      {heroSlides[heroIndex].subtitle}
                    </p>
                    <Button onClick={handleShopNow} className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white font-bold px-8 py-3 text-[14px] shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-0.5 btn-gradient-purple">
                      Shop Now →
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2.5 text-white transition-colors z-20" aria-label="Previous slide">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2.5 text-white transition-colors z-20" aria-label="Next slide">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)} className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-8 h-2.5 bg-violet-500" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" style={{background: "linear-gradient(to right, transparent, rgba(192,132,252,0.4), transparent)"}}></div>

      {/* Our Warehouse */}
      <section className="bg-white/70 backdrop-blur-sm py-10 border-b border-purple-100/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <p className="text-[13px] font-bold text-gray-800 tracking-[0.2em] uppercase mb-2">{content.warehouseEyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-gray-900">
              {content.warehouseTitle}
            </h2>
          </div>
        </div>
        <div className="overflow-hidden relative">
          <div className="flex gap-6 py-2 warehouse-track">
            {content.warehouseTrackImages.map((src, i) => (
              <div key={i} className="shrink-0 w-[300px] sm:w-[400px] lg:w-[500px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={src}
                  alt={`Akihabara TCG Warehouse - Shipment ${src.match(/(\d+)\.webp/)?.[1] ?? i + 1}`}
                  className="w-full h-[250px] sm:h-[280px] lg:h-[300px] object-cover block"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <img
                src={content.warehouseWideImage}
                alt={content.warehouseWideAlt}
                className="w-full h-[200px] sm:h-[260px] lg:h-[320px] object-cover block"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white/60 backdrop-blur-sm border-b border-purple-100/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.trustBadges.map((badge, i) => {
              const BadgeIcon = CONTENT_ICONS[badge.icon] ?? Package;
              const color = ["text-emerald-600 bg-emerald-50", "text-blue-600 bg-blue-50", "text-amber-600 bg-amber-50", "text-rose-600 bg-rose-50"][i % 4];
              return (
                <div key={badge.title} className="flex items-center gap-3 justify-center py-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <BadgeIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900">{badge.title}</p>
                    <p className="text-[13px] text-gray-500">{fillThreshold(badge.desc, freeShippingThreshold)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-28">
        <div className="space-y-10">
          {isHomepageView && (
            <div className="text-center">
              <p className="text-[13px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-2">{content.collectionEyebrow}</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-white">{content.collectionTitle}</h2>
              <p className="text-[14px] text-gray-300 mt-1">{content.collectionSub}</p>
            </div>
          )}

          {/* Category tabs now live in the header (see the header category bar) */}

          {/* Sub-Category Tabs */}
          {!isHomepageView && selectedCategory !== "all" && buildSubcategoryTabs(selectedCategory, products, loading).length > 0 && (
            <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
              <div className="flex gap-2 pb-2 min-w-max">
                <button
                  onClick={() => setSelectedSubcategory("all")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedSubcategory === "all"
                      ? "bg-violet-500 text-white shadow-sm"
                      : "bg-white/60 backdrop-blur-sm text-gray-500 hover:bg-white/80 border border-purple-100/30"
                  }`}
                >
                  All
                </button>
                {buildSubcategoryTabs(selectedCategory, products, loading).map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setSelectedSubcategory(sub.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedSubcategory === sub.key
                        ? "bg-violet-500 text-white shadow-sm"
                        : "bg-white/60 backdrop-blur-sm text-gray-500 hover:bg-white/80 border border-purple-100/30"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isHomepageView && (
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-gray-300">
                {filteredProducts.length} products{selectedCategory !== "all" ? ` in ${categoryTabs.find((t) => t.key === selectedCategory)?.label}` : ""}
              </p>
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-44 h-9 text-[12px] border-gray-200 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/95 rounded-xl overflow-hidden shadow-md border border-purple-100/50">
                  <div className="relative aspect-square bg-gradient-to-br from-purple-50/50 to-white animate-shimmer" />
                  <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-shimmer w-1/4" />
                    <div className="h-3 bg-gray-200 rounded animate-shimmer w-3/4" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="size-3.5 bg-gray-200 rounded animate-shimmer" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-gray-200 rounded animate-shimmer w-1/3" />
                      <div className="h-4 bg-gray-200 rounded animate-shimmer w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isHomepageView ? (
            /* ── Homepage Category Showcase: 4 products per category with gradient pills ── */
            categoryOrder.map((catKey) => {
              const catProducts = productsByCategory[catKey];
              if (!catProducts || catProducts.length === 0) return null;
              const catTab = categoryTabs.find(t => t.key === catKey);
              const catLabel = catTab?.label || catKey;
              const catGradient = catTab?.gradient || "from-purple-500 to-indigo-500";
              const totalInCat = catProducts.length;
              // Show 4 products per category on homepage, sorted by priority
              const getCatPriority = (p: Product): number => {
                const cats = p.categories || [];
                const sub = p.subcategory || (cats.length > 1 ? cats[1] : "");
                const subLower = sub.toLowerCase();
                if (subLower === "sealed case") return 0;
                if (subLower === "booster boxes") return 1;
                if (subLower.includes("special")) return 2;
                if (subLower === "promo") return 3;
                return 4;
              };
              // Series prefix priority: OP first, then EB, then PRB, then others
              const getSeriesPri = (p: Product): number => {
                const title = p.title.toUpperCase();
                if (title.match(/^OP[-\s]?\d/i)) return 0;
                if (title.match(/^EB[-\s]?\d/i)) return 1;
                if (title.match(/^PRB[-\s]?\d/i)) return 2;
                if (title.match(/^ST[-\s]?\d/i)) return 3;
                if (title.match(/^SV[-\s]?\d/i)) return 4;
                if (title.match(/^PR[-\s]?\d/i)) return 5;
                return 9;
              };
              const getSeriesNum = (p: Product): number => {
                const m = p.title.match(/(?:OP|EB|PRB|ST|SV|PR)[-\s]?(\d+)/i);
                return m ? parseInt(m[1], 10) : 0;
              };
              const displayProducts = [...catProducts]
                .sort((a, b) => {
                  // Manual position (admin "Position" field) takes priority
                  const oa = typeof a.sort_order === "number" ? a.sort_order : Number.MAX_SAFE_INTEGER;
                  const ob = typeof b.sort_order === "number" ? b.sort_order : Number.MAX_SAFE_INTEGER;
                  if (oa !== ob) return oa - ob;
                  const pa = getCatPriority(a);
                  const pb = getCatPriority(b);
                  if (pa !== pb) return pa - pb;
                  const sa = getSeriesPri(a);
                  const sb = getSeriesPri(b);
                  if (sa !== sb) return sa - sb;
                  return getSeriesNum(b) - getSeriesNum(a);
                });

              return (
                <div key={catKey}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${catGradient}`}></div>
                      <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-montserrat)] text-white">{catLabel}</h3>
                      <span className="text-[12px] text-gray-200 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{totalInCat} products</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => { setSelectedCategory(catKey); setSelectedSubcategory("all"); }}
                      className="text-gray-200 hover:text-white hover:bg-white/20 font-bold gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 h-9 text-[13px]"
                    >
                      View All
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {displayProducts.map((product) => (
                      <ProductCard key={product.id} product={product} currency={currency} onOpen={openProductModal} onAddToCart={addToCart} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="size-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-[16px] font-semibold text-gray-300">No products found</h3>
              <p className="text-[13px] text-gray-300 mt-1">Try adjusting your search or category filter</p>
              <Button variant="outline" className="mt-4 text-[13px]" onClick={() => { setSelectedCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <ProductCard key={product.id} product={product} currency={currency} onOpen={openProductModal} onAddToCart={addToCart} />
                  ))}
                </AnimatePresence>
              </motion.div>
              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3 text-[14px] rounded-lg border border-white/20 transition-all hover:-translate-y-0.5"
                  >
                    Load More Products ({filteredProducts.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-purple-950 text-white py-16 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-violet-900/50 to-purple-950" style={{background: "linear-gradient(to bottom right, #3b0764, rgba(76,29,149,0.5), #3b0764)"}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-4">
              {content.whyEyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-4">
              {content.whyTitle}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-[14px] leading-relaxed">
              {content.whyIntro}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.features.map((item) => {
              const FeatureIcon = CONTENT_ICONS[item.icon] ?? Package;
              return (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <FeatureIcon className="size-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-[13px] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 bg-white/5 rounded-xl p-8 border border-white/10">
            <h3 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] mb-6 text-center">
              {content.includesTitle}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.includes.map((item) => (
                <div key={item.title} className="text-center p-4">
                  <h4 className="font-semibold text-white text-[14px] mb-1">{item.title}</h4>
                  <p className="text-[12px] text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-violet-400 tracking-[0.2em] uppercase mb-3">{content.reviewsEyebrow}</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-purple-900">
              {content.reviewsTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.reviews.map((review, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100/30">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-950 flex items-center justify-center text-white text-[13px] font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-purple-900">{review.name}</p>
                    <p className="text-[11px] text-gray-400">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────── About Page ─────────── */

function AboutPage({ content }: { content: ClientSiteContent["about"] }) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-purple-950 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-6">
            {content.title}
          </h1>
          <p className="text-[15px] text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {content.intro}
          </p>
        </div>
      </section>

      {/* Our Purpose */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-3">{content.purposeEyebrow}</p>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white mb-4">
                {content.purposeTitle}
              </h2>
              {content.purposeParagraphs.map((para, i) => (
                <p key={i} className={`text-[14px] text-gray-300 leading-relaxed${i < content.purposeParagraphs.length - 1 ? " mb-4" : ""}`}>
                  {para}
                </p>
              ))}
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-white mb-6">
                {content.trustTitle}
              </h3>
              <div className="space-y-4">
                {content.trustItems.map((item) => {
                  const ItemIcon = CONTENT_ICONS[item.icon] ?? Package;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
                        <ItemIcon className="size-4 text-violet-200" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{item.title}</p>
                        <p className="text-[12px] text-gray-300">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="py-16 bg-violet-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-violet-400 tracking-[0.2em] uppercase mb-3">{content.carryEyebrow}</p>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-purple-900">
              {content.carryTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.carryItems.map((item) => {
              const ItemIcon = CONTENT_ICONS[item.icon] ?? Package;
              return (
                <div key={item.title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-purple-900/5 flex items-center justify-center mx-auto mb-4">
                    <ItemIcon className="size-5 text-purple-900" />
                  </div>
                  <h3 className="font-semibold text-[14px] text-purple-900 mb-2">{item.title}</h3>
                  <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-violet-400/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="size-7 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-purple-900 mb-4">
            {content.guaranteeTitle}
          </h2>
          {content.guaranteeParagraphs.map((para, i) => (
            <p key={i} className={`text-[14px] text-gray-600 leading-relaxed${i < content.guaranteeParagraphs.length - 1 ? " mb-4" : ""}`}>
              {para}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─────────── Shipping Page ─────────── */

function ShippingPage({ content, freeShippingThreshold }: { content: ClientSiteContent["shipping"]; freeShippingThreshold: number }) {
  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            {content.title}
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            {content.intro}
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {content.sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-purple-900 mb-3">
                {section.title}
              </h2>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
                {fillThreshold(section.content, freeShippingThreshold)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─────────── FAQ Page ─────────── */

function FAQPage({ content }: { content: ClientSiteContent["faq"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = content.items;

  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            {content.title}
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            {content.intro}
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-[14px] font-semibold text-purple-900 pr-4 group-hover:text-violet-400 transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown className={`size-5 text-gray-400 shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[13px] text-gray-600 leading-relaxed pb-5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────── Contact Page ─────────── */

function ContactPage({ content, storeEmail }: { content: ClientSiteContent["contact"]; storeEmail: string }) {
  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            {content.title}
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            {content.intro}
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {content.cards.map((item) => {
              const ItemIcon = CONTENT_ICONS[item.icon] ?? Mail;
              return (
                <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-900/5 flex items-center justify-center mx-auto mb-4">
                    <ItemIcon className="size-5 text-purple-900" />
                  </div>
                  <h3 className="font-semibold text-[14px] text-purple-900 mb-1">{item.title}</h3>
                  <p className="text-[13px] text-gray-700">{item.icon === "Mail" ? storeEmail : item.detail}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-purple-900 mb-6">
              {content.formTitle}
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Name</label>
                  <Input placeholder="Your name" className="h-10 text-[13px] border-gray-200" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email</label>
                  <Input type="email" placeholder="you@example.com" className="h-10 text-[13px] border-gray-200" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Subject</label>
                <Input placeholder="How can we help?" className="h-10 text-[13px] border-gray-200" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us what you need..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-900/10 focus:border-purple-900"
                />
              </div>
              <Button className="bg-purple-950 hover:bg-purple-800 text-white font-semibold px-6 text-[13px] h-10">
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────── Sign In / Sign Up Page ─────────── */

function SignInPage({ onSignIn, freeShippingThreshold }: { onSignIn: (user: { id: string; email: string; name: string }) => void; freeShippingThreshold: number }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      let user: { id?: string; email?: string; name?: string | null } | null = null;
      // postToApi() only counts a JSON response as "backend present": the
      // static deployment answers POSTs to missing routes with an EMPTY 200,
      // so a bare status/ok check cannot detect the static host.
      const api = await postToApi("/api/auth/signup", { email, password, name });

      if (!api.real) {
        // Static deployment — no /api routes. Create the account directly
        // in the store database from the browser.
        user = await directSignUp({ email, password, name });
      } else {
        if (!api.ok) { setError(String(api.data.error || "Sign up failed.")); return; }
        user = api.data as { id?: string; email?: string; name?: string | null };
      }

      // Auto sign-in after signup (user is the user object)
      onSignIn({ id: user.id ?? "", email: user.email ?? "", name: user.name || name });
      setSuccess("Account created successfully! Welcome aboard.");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Network error. Please try again.");
    }
    finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    try {
      let user: { id?: string; email?: string; name?: string | null } | null = null;
      const api = await postToApi("/api/auth/signin", { email, password });

      if (!api.real) {
        // Static deployment — no /api routes. Check credentials directly
        // against the store database from the browser.
        user = await directSignIn({ email, password });
      } else {
        if (!api.ok) { setError(String(api.data.error || "Invalid email or password.")); return; }
        user = api.data as { id?: string; email?: string; name?: string | null };
      }

      // user is the user object
      onSignIn({ id: user.id ?? "", email: user.email ?? "", name: user.name || "" });
      setSuccess("Welcome back!");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Network error. Please try again.");
    }
    finally { setLoading(false); }
  };

  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{isSignUp ? "Create Account" : "Welcome Back"}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            {isSignUp ? "Join Akihabara TCG Warehouse" : "Sign In to Your Account"}
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            {isSignUp ? "Create an account to track orders, save favorites, and get exclusive deals." : "Access your orders, wishlist, and exclusive member pricing."}
          </p>
        </div>
      </section>

      <section className="bg-violet-50 py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">{success}</div>
            )}

            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Full Name</label>
                  <Input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Password</label>
                  <Input type="password" placeholder="Create a password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                  <Input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <Button type="submit" className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-[12px] text-gray-500 text-center mt-4">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-gray-700">Password</label>
                    <button type="button" className="text-[11px] text-violet-400 hover:underline">Forgot password?</button>
                  </div>
                  <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" disabled={loading} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-gray-300" />
                  <label htmlFor="remember" className="text-[12px] text-gray-600">Remember me</label>
                </div>
                <Button type="submit" className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[12px] text-gray-500 text-center">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); setEmail(""); setPassword(""); setName(""); setConfirmPassword(""); }}
                  className="text-violet-400 font-semibold hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[
              { icon: Shield, text: "Secure checkout with SSL encryption" },
              { icon: Truck, text: `Free shipping on orders over $${freeShippingThreshold}` },
              { icon: Package, text: "Track your orders and manage returns" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-[13px] text-gray-500">
                <item.icon className="size-4 text-violet-400 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────── Product Card ─────────── */

function ProductCard({
  product,
  currency,
  onOpen,
  onAddToCart,
}: {
  product: Product;
  currency: CurrencyCode;
  onOpen: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const hasOriginalPrice = (product.original_price ?? 0) > product.price;
  const isPreOrder = product.in_stock === false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border border-purple-100/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="relative aspect-square bg-gradient-to-br from-purple-50/50 to-white overflow-hidden" style={{background: "linear-gradient(to bottom right, rgba(250,245,255,0.5), #ffffff)"}} onClick={() => onOpen(product)}>
        <ProductImg src={product.image} alt={product.title} fill className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.03)] pointer-events-none"></div>
        {hasOriginalPrice && (
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm" style={{background: "linear-gradient(to right, #f97316, #ef4444)"}}>
              -{getDiscountPercent(product.original_price!, product.price)}%
            </span>
          </div>
        )}
        {isPreOrder && (
          <div className="absolute top-1.5 right-1.5">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm" style={{background: "linear-gradient(to right, #f59e0b, #f97316)"}}>
              Pre-Order
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)"}}>
          <Button
            className={`w-full text-white hover:opacity-90 text-[11px] font-semibold shadow-md h-7 ${isPreOrder ? "bg-gradient-to-r from-amber-600 to-orange-600" : "bg-gradient-to-r from-purple-700 to-violet-600"}`}
            style={isPreOrder ? {background: "linear-gradient(to right, #d97706, #ea580c)"} : {background: "linear-gradient(to right, #6d28d9, #7c3aed)"}}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            {isPreOrder ? "Pre-Order" : "Add to Cart"}
          </Button>
        </div>
      </div>

      <div className="p-2.5" onClick={() => onOpen(product)}>
        <Badge variant="secondary" className="text-[9px] font-medium mb-1.5 bg-purple-900/5 text-purple-900 hover:bg-purple-900/10">
          {product.category}
        </Badge>
        <h3 className="text-[12px] sm:text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem]">
          {/* Crawlable internal link to the dedicated product page (SEO) */}
          <Link
            href={`/product/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-purple-700 transition-colors"
          >
            {product.title}
          </Link>
        </h3>
        <div className="flex items-center gap-1 mb-1.5">
          {renderStars(product.rating ?? 0)}
          <span className="text-[10px] text-gray-400 ml-0.5">({product.rating ?? 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] sm:text-[15px] font-bold text-gray-900">
              {formatPrice(product.price, currency)}
            </span>
            {hasOriginalPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.original_price ?? 0, currency)}
              </span>
            )}
          </div>
          {isPreOrder && (
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Pre-Order
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Product Detail Modal ─────────── */

function ProductDetailModal({
  product,
  currency,
  onClose,
  onAddToCart,
}: {
  product: Product;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToCart: (p: Product, q?: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const hasOriginalPrice = (product.original_price ?? 0) > product.price;
  const isPreOrder = product.in_stock === false;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 aspect-square bg-gray-50 shrink-0">
        <ProductImg src={product.image} alt={product.title} fill className="object-contain p-6" sizes="(max-width: 768px) 100vw, 50vw" />
        {isPreOrder && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md" style={{background: "linear-gradient(to right, #f59e0b, #f97316)"}}>
              Pre-Order
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <DialogHeader className="text-left p-0 mb-4">
          <Badge variant="secondary" className="text-[10px] font-medium mb-2 w-fit bg-purple-900/5 text-purple-900">
            {product.category}
          </Badge>
          <DialogTitle className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-purple-900 leading-snug">
            {product.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Product details for {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">{renderStars(product.rating ?? 0)}</div>
          <span className="text-[12px] font-medium text-gray-600">{product.rating ?? 0} / 5</span>
        </div>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-2xl font-bold text-purple-900">{formatPrice(product.price, currency)}</span>
          {hasOriginalPrice && (
            <span className="text-[14px] text-gray-400 line-through">{formatPrice(product.original_price ?? 0, currency)}</span>
          )}
          {hasOriginalPrice && (
            <Badge className="bg-purple-900/10 text-purple-900 border-0 text-[11px] font-bold">
              Our Price
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2.5 h-2.5 rounded-full ${isPreOrder ? "bg-amber-500" : "bg-green-500"}`} />
          <span className={`text-[13px] font-medium ${isPreOrder ? "text-amber-600" : "text-green-600"}`}>
            {isPreOrder ? "Pre-Order — Ships when available" : "In Stock"}
          </span>
        </div>

        <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
          {product.description || "No description available."}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-gray-600">Qty:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <Button variant="ghost" size="icon" className="size-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-[13px] font-semibold">{quantity}</span>
              <Button variant="ghost" size="icon" className="size-9" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <Button
            className={`w-full text-white font-semibold h-11 text-[14px] ${isPreOrder ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90" : "bg-purple-950 hover:bg-purple-800"}`}
            style={isPreOrder ? {background: "linear-gradient(to right, #d97706, #ea580c)"} : {}}
            onClick={handleAdd}
          >
            <ShoppingCart className="size-4 mr-2" />
            {isPreOrder ? "Pre-Order Now" : "Add to Cart"}
          </Button>

          {isPreOrder && (
            <p className="text-[11px] text-amber-600 text-center leading-relaxed">
              This is a pre-order item. Your order will be reserved and shipped as soon as stock becomes available.
            </p>
          )}

          {/* Internal link to dedicated product page (SEO + details) */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-center text-[12px] font-semibold text-violet-500 hover:text-purple-700 transition-colors"
          >
            View Full Details →
          </Link>

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-[11px] text-gray-400"><Shield className="size-3.5" /><span>Authentic</span></div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400"><Truck className="size-3.5" /><span>Fast Ship</span></div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400"><Globe className="size-3.5" /><span>Worldwide</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Checkout Page ─────────── */

function CheckoutPage({ cart, cartTotal, currency, navigateTo, clearCart, whatsappLink, content, settings }: {
  cart: CartItem[];
  cartTotal: number;
  currency: CurrencyCode;
  navigateTo: (page: PageView) => void;
  clearCart: () => void;
  whatsappLink: string;
  content: ClientSiteContent["checkout"];
  settings: ClientSiteContent["settings"];
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  // Orders placed without a backend (static hosting / database not
  // configured) are stored locally and confirmed via live chat or email.
  const [offlineOrder, setOfflineOrder] = useState(false);
  const [orderSummary, setOrderSummary] = useState("");
  // Deep link (wa.me?text=…) for the placed order — rebuilt whenever the
  // final order id becomes available, so both the auto-opened tab and the
  // confirmation-screen button carry the exact same order reference.
  const [waOrderUrl, setWaOrderUrl] = useState("");
  // Plain-text copy of the placed order (captured BEFORE the cart is cleared)
  // so the confirmation screen can still offer email / clipboard fallbacks.
  const [placedOrderText, setPlacedOrderText] = useState("");

  const freeShippingThreshold = Number(settings.freeShippingThreshold) || 500;
  const standardShippingFee = Number(settings.standardShippingFee) || 15;
  const shippingCost = cartTotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const grandTotal = cartTotal + shippingCost;

  /* Pre-filled WhatsApp order message: everything the shop needs to confirm
     and ship the order, so the customer only has to press Send. The message
     body is the admin-editable template in the checkout content key. */
  const COUNTRY_LABELS: Record<string, string> = {
    US: "United States", CA: "Canada", GB: "United Kingdom", DE: "Germany",
    FR: "France", ES: "Spain", IT: "Italy", AU: "Australia", JP: "Japan",
    KR: "South Korea", SG: "Singapore", BR: "Brazil", MX: "Mexico",
    NL: "Netherlands", SE: "Sweden", CH: "Switzerland", PH: "Philippines",
    MY: "Malaysia", OTHER: "Other",
  };
  const PAYMENT_LABELS: Record<string, string> = Object.fromEntries(
    (settings.paymentMethods || []).map((m) => [m.id, m.label]),
  );
  const buildWhatsAppOrderMessage = (orderId: string) => {
    const itemsText = cart
      .map(
        (item) =>
          `${item.quantity}x ${item.product.title} — ${formatPrice(item.product.price * item.quantity, currency)}`
      )
      .join("\n");
    const addressText = `${shippingAddress}, ${shippingCity}, ${COUNTRY_LABELS[shippingCountry] || shippingCountry}${shippingZip ? " " + shippingZip : ""}`;
    return content.whatsappTemplate
      .split("{notesLine}\n")
      .join(notes.trim() ? `Notes: ${notes.trim()}\n` : "")
      .split("{orderId}").join(orderId)
      .split("{siteName}").join(settings.siteName)
      .split("{items}").join(itemsText)
      .split("{subtotal}").join(formatPrice(cartTotal, currency))
      .split("{shipping}").join(shippingCost === 0 ? "Free" : formatPrice(shippingCost, currency))
      .split("{total}").join(formatPrice(grandTotal, currency))
      .split("{name}").join(customerName)
      .split("{email}").join(customerEmail)
      .split("{phone}").join(customerPhone)
      .split("{address}").join(addressText)
      .split("{payment}").join(PAYMENT_LABELS[paymentMethod] || paymentMethod)
      .split("{notesLine}").join(notes.trim() ? `Notes: ${notes.trim()}` : "");
  };

  const buildWhatsAppOrderUrl = (orderId: string) =>
    `${whatsappLink}?text=${encodeURIComponent(buildWhatsAppOrderMessage(orderId))}`;

  // Open the Tawk.to widget (loaded globally by the root layout) with the
  // customer's details pre-attached, so confirming an offline order in chat
  // takes one click.
  const confirmViaLiveChat = () => {
    const w = window as typeof window & {
      Tawk_API?: {
        maximize?: () => void;
        setAttributes?: (
          attrs: Record<string, string>,
          cb?: (error: unknown) => void
        ) => void;
      };
    };
    if (!w.Tawk_API) return;
    try {
      w.Tawk_API.setAttributes?.({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      });
    } catch {
      // setAttributes is only available once the widget has loaded
    }
    try {
      w.Tawk_API.maximize?.();
    } catch {
      // widget not ready — customer can still use the email option
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !shippingCity || !shippingCountry || !paymentMethod) return;

    setSubmitting(true);
    const newOrderId = "AKI-" + Date.now().toString(36).toUpperCase();

    // Hand the order to the shop on WhatsApp: open the chat with the full
    // order pre-filled BEFORE any await so popup blockers allow it (this runs
    // synchronously inside the click handler). The order is still saved to
    // the store database below — WhatsApp is the confirmation channel, the
    // database is what the admin panel reads.
    const waUrl = buildWhatsAppOrderUrl(newOrderId);
    setWaOrderUrl(waUrl);
    setPlacedOrderText(buildWhatsAppOrderMessage(newOrderId));
    window.open(waUrl, "_blank", "noopener,noreferrer");
    // If the popup was blocked, the confirmation screen still shows a large
    // "Send Order via WhatsApp" button — the customer never dead-ends.

    // No backend available (static hosting, or database not configured) —
    // save the order locally and guide the customer to confirm it via live
    // chat or email. The storefront never dead-ends.
    const placeOfflineOrder = () => {
      const summary = [
        `Order ${newOrderId}`,
        ...cart.map(
          (item) =>
            `${item.quantity}x ${item.product.title} — $${(item.product.price * item.quantity).toFixed(2)}`
        ),
        `Shipping: ${shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}`,
        `Total: $${grandTotal.toFixed(2)}`,
        `Name: ${customerName}`,
        `Email: ${customerEmail}`,
        `Phone: ${customerPhone}`,
        `Ship to: ${shippingAddress}, ${shippingCity}, ${shippingCountry} ${shippingZip}`,
        `Payment: ${paymentMethod}`,
      ].join("\n");
      try {
        const saved = JSON.parse(
          localStorage.getItem("aki_offline_orders") || "[]"
        ) as unknown[];
        saved.push({
          id: newOrderId,
          placedAt: new Date().toISOString(),
          total: grandTotal,
          items: cart.map((item) => ({
            productId: item.product.id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
          })),
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: shippingAddress,
            city: shippingCity,
            country: shippingCountry,
            zip: shippingZip,
            paymentMethod,
            notes,
          },
        });
        localStorage.setItem("aki_offline_orders", JSON.stringify(saved));
      } catch {
        // localStorage unavailable — the summary is still shown on screen
      }
      setOrderSummary(summary);
      setOfflineOrder(true);
      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
    };

    try {
      // Submit order via API (used when the site is deployed with a backend).
      // postToApi() only counts a JSON response as "backend present": the
      // static deployment (Cloudflare → Render static) answers POSTs to
      // missing routes with an EMPTY 200, so a bare res.ok check would
      // silently swallow the order.
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        product_id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));
      const api = await postToApi("/api/orders", {
        orderId: newOrderId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingCountry,
        shippingZip,
        paymentMethod,
        notes,
        items: orderItems,
      });

      if (api.real && api.ok) {
        // Backend accepted the order.
        const serverId = (api.data as { id?: string }).id;
        const finalId = String(serverId || newOrderId);
        setOfflineOrder(false);
        setOrderId(finalId);
        // Keep the WhatsApp message and the stored order id in sync.
        if (finalId !== newOrderId) {
          setWaOrderUrl(buildWhatsAppOrderUrl(finalId));
          setPlacedOrderText(buildWhatsAppOrderMessage(finalId));
        }
        setOrderPlaced(true);
        clearCart();
      } else if (!api.real) {
        // Static deployment — no /api routes. Record the order directly in
        // the store database from the browser so it reaches the admin panel.
        const dbOrderId = await directCreateOrder({
          orderId: newOrderId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingCountry,
          shippingZip,
          paymentMethod,
          notes,
          items: cart.map((item) => ({
            productId: item.product.id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        });
        const finalId = dbOrderId || newOrderId;
        setOfflineOrder(false);
        setOrderId(finalId);
        if (finalId !== newOrderId) {
          setWaOrderUrl(buildWhatsAppOrderUrl(finalId));
          setPlacedOrderText(buildWhatsAppOrderMessage(finalId));
        }
        setOrderPlaced(true);
        clearCart();
      } else {
        // API present but rejected (e.g. database not configured) — offline flow
        placeOfflineOrder();
      }
    } catch {
      // No network / direct insert failed — offline flow
      placeOfflineOrder();
    } finally {
      setSubmitting(false);
    }
  };

  // Scroll to top when order is placed
  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [orderPlaced]);

  if (orderPlaced) {
    return (
      <div>
        <section className="bg-purple-950 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
              {content.thankYouTitle}
            </h1>
            <p className="text-[14px] text-gray-200 max-w-xl mx-auto mb-2">
              {content.thankYouRefLabel}
            </p>
            <p className="text-2xl font-bold text-violet-300 mb-6">{orderId}</p>
            <p className="text-[13px] text-gray-300 max-w-md mx-auto mb-8">
              {waOrderUrl ? (
                <span dangerouslySetInnerHTML={{ __html: content.thankYouTextWa }} />
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: content.thankYouTextNoWa
                      .split("{phone}")
                      .join(settings.whatsappNumber),
                  }}
                />
              )}
            </p>
            {waOrderUrl && (
              <div className="flex flex-col items-center gap-3 mb-6">
                <a
                  href={waOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#2fe671] to-[#20bd5a] px-8 py-4 text-[16px] font-extrabold text-white shadow-[0_10px_34px_rgba(37,211,102,0.55)] ring-2 ring-white/70 hover:scale-[1.03] active:scale-[0.97] transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {content.sendButtonLabel}
                </a>
                <p className="text-[11px] text-gray-400">
                  {content.sendButtonSub}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <a
                href={`mailto:${settings.storeEmail}?subject=${encodeURIComponent(`Order ${orderId} — Akihabara TCG Warehouse`)}&body=${encodeURIComponent(orderSummary || placedOrderText)}`}
                className="inline-flex items-center justify-center h-11 px-8 rounded-md border border-violet-400/40 text-violet-200 hover:bg-violet-500/10 font-semibold text-[14px] transition-colors"
              >
                Confirm via Email
              </a>
              {offlineOrder && (
                <Button className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-8 h-11" onClick={confirmViaLiveChat}>
                  Confirm via Live Chat
                </Button>
              )}
              <Button
                variant="outline"
                className="border-violet-400/40 text-violet-200 hover:bg-violet-500/10 h-11 font-semibold"
                onClick={() => navigator.clipboard?.writeText(orderSummary || placedOrderText).catch(() => {})}
              >
                Copy Order Details
              </Button>
            </div>
            {offlineOrder && orderSummary && (
              <details className="max-w-xl mx-auto mb-8 text-left">
                <summary className="text-[12px] text-violet-300 cursor-pointer select-none text-center">
                  View saved order summary
                </summary>
                <pre className="mt-3 text-[12px] text-gray-300 bg-black/30 rounded-lg p-4 whitespace-pre-wrap break-words">{orderSummary}</pre>
              </details>
            )}
            <Button className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-8 h-11" onClick={() => navigateTo("shop")}>
              Continue Shopping
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div>
        <section className="bg-purple-950 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">{content.emptyTitle}</h1>
            <p className="text-[14px] text-gray-200">{content.emptyText}</p>
          </div>
        </section>
        <section className="bg-violet-50 py-16">
          <div className="max-w-md mx-auto px-4 text-center">
            <Button className="bg-purple-950 hover:bg-purple-800 text-white font-semibold px-8 h-11" onClick={() => navigateTo("shop")}>
              Browse Products
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            {content.title}
          </h1>
          <p
            className="text-[14px] text-gray-200 max-w-xl mx-auto"
            dangerouslySetInnerHTML={{ __html: content.introHtml }}
          />
        </div>
      </section>

      <section className="bg-violet-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Form (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[15px] font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-950 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                    <Input placeholder="John Smith" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email Address *</label>
                    <Input type="email" placeholder="you@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Phone Number *</label>
                    <Input placeholder="+1 555-0123" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[15px] font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-950 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Street Address *</label>
                    <Input placeholder="123 Main St, Apt 4B" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">City *</label>
                      <Input placeholder="New York" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Country *</label>
                      <select
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400"
                      >
                        <option value="">Select country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                        <option value="AU">Australia</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>
                        <option value="SG">Singapore</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="CH">Switzerland</option>
                        <option value="PH">Philippines</option>
                        <option value="MY">Malaysia</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">ZIP / Postal</label>
                      <Input placeholder="10001" value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[15px] font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-950 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Choose Preferred Payment Method *
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(settings.paymentMethods || []).map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-violet-400 bg-violet-400/5"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-0.5 accent-violet-400"
                      />
                      <div>
                        <span className="text-[13px] font-semibold text-gray-900">{method.label}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{method.instructions}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-[15px] font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-950 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                  Additional Notes (Optional)
                </h2>
                <textarea
                  placeholder="Any special instructions, gift wrapping requests, or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 resize-none"
                />
              </div>
            </div>

            {/* Right: Order Summary (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-[15px] font-bold text-purple-900 mb-4">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <ProductImg src={item.product.image} alt={item.product.title} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate">{item.product.title}</p>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[12px] font-semibold text-gray-900 shrink-0">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shippingCost, currency)
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-[10px] text-gray-400">Free shipping on orders over {formatPrice(freeShippingThreshold, currency)}</p>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-[15px] font-bold">
                    <span>Total</span>
                    <span className="text-purple-900">{formatPrice(grandTotal, currency)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Send Order Button — hands the order to WhatsApp */}
                <Button
                  className="w-full bg-gradient-to-b from-[#2fe671] to-[#20bd5a] hover:from-[#2fe671] hover:to-[#1aa851] text-white font-extrabold h-12 text-[15px] rounded-lg shadow-[0_6px_20px_rgba(37,211,102,0.4)]"
                  disabled={
                    submitting ||
                    !customerName ||
                    !customerEmail ||
                    !customerPhone ||
                    !shippingAddress ||
                    !shippingCity ||
                    !shippingCountry ||
                    !paymentMethod
                  }
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Opening WhatsApp...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Send Order via WhatsApp
                    </span>
                  )}
                </Button>
                <p className="mt-2 text-[11px] text-center text-gray-400 leading-snug">
                  Opens WhatsApp with your order pre-filled — just press <span className="font-semibold text-gray-500">Send</span> to place it.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Shield className="size-3.5 text-green-600" />
                    <span>SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Truck className="size-3.5 text-blue-600" />
                    <span>Ships direct from Japan</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Globe className="size-3.5 text-purple-600" />
                    <span>Worldwide delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
