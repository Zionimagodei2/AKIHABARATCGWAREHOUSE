"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";

import Image from "next/image";
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

/* ─────────── Types ─────────── */

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  image: string;
  description?: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  rating?: number;
  in_stock?: boolean;
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
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // Timeout fallback: if external image hasn't loaded in 8s, switch to fallback
  React.useEffect(() => {
    if (isLocalImage(src) || imgError) return;
    const timer = setTimeout(() => {
      if (imgRef.current && !imgRef.current.complete) {
        setImgError(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [src, imgError]);

  if (isLocalImage(src) && !imgError) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  }

  const imgSrc = imgError ? "/images/existing/ONE.webp" : src;

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className || ""}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } : { width: width || "100%", height: height || "100%", objectFit: "contain" }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== window.location.origin + "/images/existing/ONE.webp") {
          target.src = "/images/existing/ONE.webp";
        }
      }}
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
  { key: "One Piece", label: "One Piece", gradient: "from-yellow-500 to-amber-500", sectionGradient: "from-yellow-500/20 to-amber-500/20" },
  { key: "Other TCG", label: "Other Categories", gradient: "from-purple-500 to-indigo-500", sectionGradient: "from-purple-500/20 to-indigo-500/20" },
];

const SUBCATEGORY_TABS: Record<string, { key: string; label: string }[]> = {
  "Pokemon": [
    { key: "Booster Boxes", label: "Booster Boxes" },
    { key: "Sealed Case", label: "Sealed Case" },
    { key: "Special Set & Promo", label: "Special Set & Promo" },
    { key: "Promo", label: "Promo" },
  ],
  "One Piece": [
    { key: "Booster Boxes", label: "Booster Boxes" },
    { key: "Sealed Case", label: "Sealed Case" },
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
  const converted = usdPrice * CURRENCY_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === "JPY") {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const stars = [];
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

export default function TCGStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
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
  const [visibleCount, setVisibleCount] = useState(12);

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

  // Load Tawk.to live chat after a 5-second delay so it doesn't block initial page load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      if (document.getElementById("tawk-script")) return;

      // Define Tawk_API before the script loads
      (window as Record<string, unknown>).Tawk_API = (window as Record<string, unknown>).Tawk_API || {};

      const s1 = document.createElement("script");
      s1.id = "tawk-script";
      s1.async = true;
      s1.src = "https://embed.tawk.to/6a37ce08b40d591d46abba12/1jrkvpkov";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      const s0 = document.getElementsByTagName("script")[0];
      s0.parentNode?.insertBefore(s1, s0);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch products — try Supabase REST first, then static JSON
  useEffect(() => {
    async function loadProducts() {
      try {
        // Try Supabase REST API (zero SDK, zero Proxy)
        const { isSupabaseConfigured, getProducts } = await import("@/lib/supabase-rest");
        if (isSupabaseConfigured()) {
          const { data, error } = await getProducts();
          if (data && !error && data.length > 0) {
            const cleaned = data
              .filter((p) => p.id && p.title && p.price > 0 && p.image && p.category)
              .map((p) => ({
                ...p,
                description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed. Order ${p.title} directly from Japan at unbeatable prices.`,
              }));
            setProducts(cleaned);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Supabase not configured or failed — fall through to static JSON
      }

      // Fallback: load from static products.json (always works, zero dependency)
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
        setProducts(cleaned);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
          (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()) ||
          (p.categories && p.categories.length > 1 && p.categories[1].toLowerCase() === selectedSubcategory.toLowerCase())
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
    switch (sortOption) {
      case "price-asc": filtered = [...filtered].sort((a, b) => a.price - b.price); break;
      case "price-desc": filtered = [...filtered].sort((a, b) => b.price - a.price); break;
      case "name-asc": filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "name-desc": filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title)); break;
      case "rating": filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default: break;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ─────────── Render ─────────── */

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900 noise-overlay overflow-hidden" style={{background: "linear-gradient(to bottom right, #581c87, #6d28d9, #581c87)"}}>
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb-1 absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/40 blur-3xl"></div>
        <div className="orb-2 absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-violet-500/30 blur-3xl"></div>
        <div className="orb-1 absolute -bottom-48 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-400/30 blur-3xl"></div>
      </div>

      {/* ─── Announcement Bar ─── */}
      <div className="bg-purple-950 text-white overflow-hidden relative">
        <div className="animate-marquee flex whitespace-nowrap py-2.5">
          {[...ANNOUNCEMENT_MESSAGES, ...ANNOUNCEMENT_MESSAGES].map((msg, i) => (
            <span key={i} className="mx-10 text-[14px] font-light tracking-wide opacity-90">
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
            <button onClick={() => navigateTo("shop")} className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-opacity shrink-0">
                <img src="/logo.png?v=2" alt="Akihabara TCG Warehouse" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[17px] font-extrabold font-[family-name:var(--font-montserrat)] text-purple-900 leading-none tracking-tight">
                  AKIHABARA
                </h1>
                <p className="text-[9px] font-bold text-violet-400 tracking-[0.25em] uppercase leading-none mt-0.5">
                  TCG Warehouse
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: "Shop", page: "shop" as PageView },
                { label: "About", page: "about" as PageView },
                { label: "Shipping", page: "shipping" as PageView },
                { label: "FAQ", page: "faq" as PageView },
                { label: "Contact", page: "contact" as PageView },
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
        {currentPage === "shop" && <ShopPage products={products} loading={loading} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} searchQuery={searchQuery} sortOption={sortOption} setSortOption={setSortOption} currency={currency} filteredProducts={filteredProducts} openProductModal={openProductModal} addToCart={addToCart} heroIndex={heroIndex} setHeroIndex={setHeroIndex} scrollToSection={scrollToSection} productsByCategory={productsByCategory} visibleCount={visibleCount} setVisibleCount={setVisibleCount} />}
        {currentPage === "about" && <AboutPage />}
        {currentPage === "shipping" && <ShippingPage />}
        {currentPage === "faq" && <FAQPage />}
        {currentPage === "contact" && <ContactPage />}
        {currentPage === "signin" && <SignInPage />}
        {currentPage === "checkout" && <CheckoutPage cart={cart} cartTotal={cartTotal} currency={currency} navigateTo={navigateTo} clearCart={clearCart} />}
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-gradient-to-r from-purple-950 via-violet-900 to-purple-950 mt-auto relative overflow-hidden" style={{background: "linear-gradient(to right, #3b0764, #4c1d95, #3b0764)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/logo.png?v=2" alt="Akihabara TCG Warehouse" className="w-full h-full object-contain" />
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
                Your trusted source for authentic Japanese TCG products — Pokémon, One Piece, Dragon Ball, and more. Every product ships direct from Japan, sealed and verified.
              </p>

            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                Navigation
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Shop All Products", page: "shop" as PageView },
                  { label: "About Us", page: "about" as PageView },
                  { label: "Shipping Policy", page: "shipping" as PageView },
                  { label: "FAQ", page: "faq" as PageView },
                  { label: "Contact Us", page: "contact" as PageView },
                  { label: "Sign In / Sign Up", page: "signin" as PageView },
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
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                Categories
              </h4>
              <ul className="space-y-3">
                {CATEGORY_TABS.slice(1).map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => { setSelectedCategory(tab.key); navigateTo("shop"); }}
                      className="text-[13px] text-gray-300 hover:text-violet-300 transition-colors"
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-bold text-white text-[13px] tracking-wide uppercase mb-5">
                Get in Touch
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">support@akihabaratcgwarehouse.com</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">We reply within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">Mon — Sat: 9AM — 6PM JST</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">Sunday: Closed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-violet-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-200">Akihabara, Tokyo</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">Japan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-gray-300">
                &copy; {new Date().getFullYear()} Akihabara TCG Warehouse. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <Shield className="size-3.5" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <CreditCard className="size-3.5" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <RotateCcw className="size-3.5" />
                  <span>30-Day Returns</span>
                </div>
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

      {/* WhatsApp Floating Contact */}
      <a
        href="https://wa.me/818029350455"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-4 bottom-2 sm:bottom-8 md:bottom-6 z-[999] bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full p-3.5 shadow-lg transition-colors flex items-center justify-center"
        style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Contact us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

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
                {cartTotal < 500 && (
                  <p className="text-[11px] text-gray-400 text-center">
                    Add {formatPrice(500 - cartTotal, currency)} more for free shipping
                  </p>
                )}
                {cartTotal >= 500 && (
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

function ShopPage({ products, loading, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, searchQuery, sortOption, setSortOption, currency, filteredProducts, openProductModal, addToCart, heroIndex, setHeroIndex, scrollToSection, productsByCategory, visibleCount, setVisibleCount }: {
  products: Product[]; loading: boolean; selectedCategory: string; setSelectedCategory: (v: string) => void;
  selectedSubcategory: string; setSelectedSubcategory: (v: string) => void;
  searchQuery: string; sortOption: SortOption; setSortOption: (v: SortOption) => void;
  currency: CurrencyCode; filteredProducts: Product[];
  openProductModal: (p: Product) => void; addToCart: (p: Product) => void;
  heroIndex: number; setHeroIndex: (v: number) => void;
  scrollToSection: (id: string) => void;
  productsByCategory: Record<string, Product[]>;
  visibleCount: number; setVisibleCount: (v: number) => void;
}) {
  // Determine if we show the homepage category showcase or the full product grid
  const isHomepageView = selectedCategory === "all" && !searchQuery.trim();

  // Category display order
  const categoryOrder = CATEGORY_TABS.filter(t => t.key !== "all").map(t => t.key);

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
                <ProductImg src={HERO_SLIDES[heroIndex].image} alt={HERO_SLIDES[heroIndex].title} fill className="object-cover" priority={heroIndex === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-900/60 to-transparent" style={{background: "linear-gradient(to right, rgba(59,7,100,0.9), rgba(88,28,135,0.6), transparent)"}} />
                <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                  <div className="max-w-lg">
                    <p className="mb-3 text-[13px] font-bold text-white tracking-[0.2em] uppercase">
                      {HERO_SLIDES[heroIndex].accent}
                    </p>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-[1.1] mb-4">
                      {HERO_SLIDES[heroIndex].title}
                    </h2>
                    <p className="text-[14px] sm:text-[16px] text-gray-200 mb-6 max-w-md leading-relaxed">
                      {HERO_SLIDES[heroIndex].subtitle}
                    </p>
                    <Button onClick={() => scrollToSection("products")} className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white font-bold px-8 py-3 text-[14px] shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-0.5 btn-gradient-purple">
                      Shop Now →
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => setHeroIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2.5 text-white transition-colors z-20" aria-label="Previous slide">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2.5 text-white transition-colors z-20" aria-label="Next slide">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {HERO_SLIDES.map((_, i) => (
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
            <p className="text-[13px] font-bold text-gray-800 tracking-[0.2em] uppercase mb-2">Direct from Japan</p>
            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-montserrat)] text-gray-900">
              Our Warehouse
            </h2>
          </div>
        </div>
        <div className="overflow-hidden relative">
          <div className="flex gap-6 py-2 warehouse-track">
            {[1, 2, 1, 2, 1, 2].map((num, i) => (
              <div key={i} className="shrink-0 w-[300px] sm:w-[400px] lg:w-[500px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img
                  src={`/images/warehouse-${num}.png`}
                  alt={`Akihabara TCG Warehouse - Shipment ${num}`}
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
                src="/images/warehouse-3.png"
                alt="Akihabara TCG Warehouse - Inside View"
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
            {[
              { icon: Shield, label: "100% Authentic", desc: "Verified products", color: "text-emerald-600 bg-emerald-50" },
              { icon: Truck, label: "Free Shipping", desc: "Orders over $500", color: "text-blue-600 bg-blue-50" },
              { icon: Globe, label: "Worldwide", desc: "Secure delivery", color: "text-amber-600 bg-amber-50" },
              { icon: Package, label: "Direct from Japan", desc: "Trusted suppliers", color: "text-rose-600 bg-rose-50" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 justify-center py-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${badge.color}`}>
                  <badge.icon className="size-5" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{badge.label}</p>
                  <p className="text-[13px] text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-10">
          {isHomepageView && (
            <div className="text-center">
              <p className="text-[13px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-2">Featured Selection</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-white">Our Collection</h2>
              <p className="text-[14px] text-gray-300 mt-1">Hand-picked highlights from each category</p>
            </div>
          )}

          {/* Category Tabs */}
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
            <div className="flex gap-2 pb-2 min-w-max">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setSelectedCategory(tab.key); setSelectedSubcategory("all"); }}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === tab.key
                      ? "bg-purple-950 text-white shadow-md"
                      : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-purple-100/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Category Tabs */}
          {!isHomepageView && selectedCategory !== "all" && SUBCATEGORY_TABS[selectedCategory] && (
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
                {SUBCATEGORY_TABS[selectedCategory].map((sub) => (
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
                {filteredProducts.length} products{selectedCategory !== "all" ? ` in ${CATEGORY_TABS.find((t) => t.key === selectedCategory)?.label}` : ""}
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
              const catTab = CATEGORY_TABS.find(t => t.key === catKey);
              const catLabel = catTab?.label || catKey;
              const catGradient = catTab?.gradient || "from-purple-500 to-indigo-500";
              const totalInCat = catProducts.length;
              // Show 4 products per category on homepage
              const displayProducts = [...catProducts]
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                .slice(0, 4);

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
              Trusted Worldwide
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-4">
              Why Choose Akihabara TCG Warehouse
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-[14px] leading-relaxed">
              Your premier source for authentic Japanese TCG products — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam, Disney Lorcana, and more. Whether you're a seasoned collector, a competitive player, or running a card business, we've got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Guaranteed Authenticity", desc: "Every item we sell is verified through trusted third-party channels. No counterfeits, ever." },
              { icon: Globe, title: "Direct from Japan", desc: "We work closely with Japanese suppliers to bring you exclusive releases and rare cards." },
              { icon: Package, title: "Wholesale & Individual", desc: "Whether you're buying one box or a pallet, we've got you covered at unbeatable prices." },
              { icon: Truck, title: "Careful, Fast Delivery", desc: "Secure packaging and prompt worldwide shipping ensure your order arrives safely." },
              { icon: Heart, title: "Reliable Support", desc: "Need assistance? Our support team is available 24/7 to guide and assist you." },
              { icon: Star, title: "Our Guarantee", desc: "We strictly avoid counterfeits and resealed packs — your trust is our top priority." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors duration-300">
                <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <item.icon className="size-5 text-white" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{item.title}</h3>
                <p className="text-gray-300 text-[13px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-white/5 rounded-xl p-8 border border-white/10">
            <h3 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] mb-6 text-center">
              Our Collection Includes
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Booster Boxes & Packs", desc: "Newly released sets and collector favorites" },
                { title: "Decks & Special Sets", desc: "Ready-to-play and collector editions" },
                { title: "Singles & Graded Cards", desc: "Vintage holos to PSA-graded rarities" },
                { title: "Bulk & Wholesale", desc: "Perfect for retailers and resellers" },
              ].map((item) => (
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
            <p className="text-[11px] font-bold text-violet-400 tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-purple-900">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Kingsley Chandler",
                quote: "I've been collecting Pokémon cards for years, and these are some of the best! The quality is fantastic, and the rare cards are definitely worth it. My collection has never looked better!",
                rating: 5,
              },
              {
                name: "Orson Lancaster",
                quote: "I love how these cards not only look great but are also perfect for battling. Whether you're a competitive player or just a fan, these cards are a must-have!",
                rating: 5,
              },
              {
                name: "Harleigh Dodson",
                quote: "I ordered these cards and was amazed at how quickly they arrived. The cards were in perfect condition, and I can't wait to add them to my deck!",
                rating: 5,
              },
              {
                name: "Lucas RH",
                quote: "I've been collecting Pokémon cards for over a decade, and these are some of the most beautiful and rare cards I've come across. Truly a treasure for any serious collector!",
                rating: 5,
              },
              {
                name: "Simons L.",
                quote: "The quality of these cards is top-notch! They arrived in perfect condition and the holographic designs are just stunning. Definitely worth the investment!",
                rating: 5,
              },
              {
                name: "Benette SH.",
                quote: "I ordered these cards for a special event, and they arrived on time and in perfect condition. Great service and an awesome product.",
                rating: 5,
              },
              {
                name: "Annah Jip",
                quote: "I was blown away by the value of these cards. Not only do you get rare and powerful Pokémon, but the price was more than fair. Highly recommend!",
                rating: 5,
              },
              {
                name: "Tilamans",
                quote: "These cards really helped me improve my strategy and power up my deck. Whether you're a seasoned player or just starting out, these cards are a fantastic choice!",
                rating: 5,
              },
              {
                name: "Megan P.",
                quote: "Amazing card quality! The quality of these cards is top-notch! They arrived in perfect condition and the holographic designs are just stunning. Definitely worth the investment!",
                rating: 5,
              },
            ].map((review, i) => (
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

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-purple-950 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">About Us</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-6">
            Trusted Worldwide for Japanese Pokémon TCG and Others
          </h1>
          <p className="text-[15px] text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Welcome to Akihabara TCG Warehouse, your premier source for authentic Japanese TCG products. From Pokémon and One Piece to Dragon Ball, Weiss Schwarz, Union Arena, Gundam, and Disney Lorcana — whether you're a seasoned collector, a competitive player, or running a card business, we offer genuine items straight from Japan at unbeatable wholesale prices.
          </p>
        </div>
      </section>

      {/* Our Purpose */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-3">Our Purpose</p>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-white mb-4">
                Connecting fans with the cards they love
              </h2>
              <p className="text-[14px] text-gray-300 leading-relaxed mb-4">
                We're here to connect fans around the globe with the most exciting and hard-to-find Japanese Pokémon cards. Our focus is to make every order secure, every card legitimate, and every customer experience smooth and satisfying.
              </p>
              <p className="text-[14px] text-gray-300 leading-relaxed">
                Based in the heart of Akihabara, Tokyo's legendary electronics and hobby district, we have direct access to the newest releases, rarest finds, and best prices. We pass those savings on to you.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h3 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-white mb-6">
                Why Thousands Trust Us
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Guaranteed Authenticity", desc: "Every item verified through trusted third-party channels" },
                  { icon: Globe, title: "Direct from Japan", desc: "Exclusive releases and rare cards from Japanese suppliers" },
                  { icon: Package, title: "Wholesale & Individual Sales", desc: "One box or a pallet — we've got you covered" },
                  { icon: Truck, title: "Careful, Fast Delivery", desc: "Secure packaging and prompt worldwide shipping" },
                  { icon: Heart, title: "Reliable Support", desc: "Our team is available 24/7 to assist you" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="size-4 text-violet-200" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{item.title}</p>
                      <p className="text-[12px] text-gray-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="py-16 bg-violet-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-violet-400 tracking-[0.2em] uppercase mb-3">What We Carry</p>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-purple-900">
              Our Collection Includes
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, title: "Booster Boxes & Packs", desc: "Newly released sets and collector favorites from every era." },
              { icon: Star, title: "Decks & Special Sets", desc: "Ready-to-play options and collector editions for every level." },
              { icon: Shield, title: "Singles & Graded Cards", desc: "From vintage holos to top-tier promos and PSA-graded rarities." },
              { icon: Globe, title: "Bulk Orders & Wholesale", desc: "Perfect for retailers and high-volume resellers." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-purple-900/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-5 text-purple-900" />
                </div>
                <h3 className="font-semibold text-[14px] text-purple-900 mb-2">{item.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Business Certificate */}
      <section className="py-16 bg-purple-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[13px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-3">Verified & Registered</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-montserrat)] text-white">
              OUR BUSINESS CERTIFICATE
            </h2>
            <p className="text-[14px] text-gray-300 mt-3 max-w-xl mx-auto">
              We are a legally registered business in Japan. Our certificates verify our authenticity and commitment to transparent operations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { src: "/images/about/20260623_112319.jpg", alt: "Business Certificate - Storefront" },
              { src: "/images/about/20260623_112136.jpg", alt: "Business Certificate - Products Display" },
              { src: "/images/about/20260623_112404.jpg", alt: "Business Certificate - Card Collection" },
              { src: "/images/about/20260623_112428.jpg", alt: "Business Certificate - Shipping Area" },
              { src: "/images/about/20260623_112502.jpg", alt: "Business Certificate - Warehouse View" },
              { src: "/images/about/certificate-extra.png", alt: "Business Certificate - Registration Document" },
              { src: "/images/about/certificate-1.png", alt: "Business Certificate - Page 1" },
            ].map((photo, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-xl border border-violet-500/20 hover:shadow-2xl transition-shadow">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full rounded-lg object-cover"
                  loading="lazy"
                />
              </div>
            ))}
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
            Our Guarantee to You
          </h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
            At Akihabara TCG Warehouse, we stand by the integrity of every product across all our lines — Pokémon, One Piece, Dragon Ball, Weiss Schwarz, Union Arena, Gundam, and more. We strictly avoid counterfeits and resealed packs — your satisfaction and trust are our top priorities.
          </p>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Join the growing number of international customers who rely on us for safe, affordable access to authentic Japanese TCG products. Begin your journey or expand your inventory today.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────── Shipping Page ─────────── */

function ShippingPage() {
  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">Shipping Policy</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            We ship worldwide from Tokyo, Japan. Here's everything you need to know about how your order gets to you.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {[
            {
              title: "Free Shipping Threshold",
              content: "Orders over $500 qualify for free standard international shipping. This is automatically applied at checkout — no coupon needed.",
            },
            {
              title: "Shipping Methods & Times",
              content: "We offer two primary shipping methods:\n\n• Standard International (10–21 business days) — Free on orders over $500, otherwise calculated at checkout.\n• Express International (5–10 business days) — Available at an additional cost. Select at checkout.\n\nPlease note: delivery times are estimates and may vary depending on your country's customs processing.",
            },
            {
              title: "Where We Ship",
              content: "We currently ship to over 50 countries including the United States, Canada, the United Kingdom, the European Union, Australia, and most of Southeast Asia. If your country isn't listed at checkout, reach out to us and we'll try to accommodate you.",
            },
            {
              title: "Packaging",
              content: "All orders are carefully packed in sturdy, protective packaging to prevent damage during transit. Booster boxes and sealed cases are wrapped in bubble padding and placed in reinforced cardboard boxes. Singles are shipped in toploaders or card savers.",
            },
            {
              title: "Tracking",
              content: "Once your order ships, you'll receive a tracking number via email. You can use this to follow your package from our warehouse in Tokyo all the way to your door.",
            },
            {
              title: "Customs & Import Duties",
              content: "International shipments may be subject to customs duties and import taxes levied by your country. These charges are the responsibility of the buyer and are not included in our product prices or shipping costs. We declare the actual value of goods on all shipments.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-purple-900 mb-3">
                {section.title}
              </h2>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─────────── FAQ Page ─────────── */

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Are your products authentic?",
      a: "Yes, 100%. Every product we sell is sourced directly from authorized Japanese distributors and verified through trusted third-party channels. We do not sell counterfeits or resealed products — ever.",
    },
    {
      q: "Do you sell individual cards or singles?",
      a: "Yes, we carry a selection of singles and graded cards. Our primary focus is sealed products (booster boxes, elite trainer boxes, sealed cases), but we do offer high-demand singles and PSA-graded cards.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for wholesale orders. All transactions are processed through secure, encrypted payment gateways.",
    },
    {
      q: "How long does shipping take?",
      a: "Standard international shipping takes 10–21 business days. Express shipping takes 5–10 business days. Delivery times may vary depending on your country's customs processing.",
    },
    {
      q: "Do you offer wholesale pricing?",
      a: "Yes! We offer competitive wholesale pricing on bulk orders and sealed cases. Contact us at support@akihabaratcgwarehouse.com with details about what you need and we'll send you a custom quote.",
    },
    {
      q: "What if my order arrives damaged?",
      a: "We take great care in packaging, but if your order arrives damaged, contact us within 48 hours with photos and we'll arrange a replacement or full refund.",
    },
    {
      q: "Can I return or exchange a product?",
      a: "We accept returns within 30 days of delivery for sealed, unopened products in their original condition. Opened products are not eligible for return. See our full return policy for details.",
    },
    {
      q: "How are your prices so much lower than other shops?",
      a: "We source directly from Japanese distributors and operate with lower overhead than most Western retailers. We pass those savings on to our customers. Our products are the exact same authentic items you'd find elsewhere — just at better prices.",
    },
    {
      q: "Do you restock sold-out items?",
      a: "We restock popular items regularly, but some limited-edition products may not be restocked once they sell out. Sign up for our newsletter or follow us on social media to get restock alerts.",
    },
    {
      q: "Is it safe to order from overseas?",
      a: "Absolutely. We use SSL encryption on our website, process payments through secure gateways, and ship with full tracking. We've successfully delivered thousands of orders to customers in over 50 countries.",
    },
  ];

  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">FAQ</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            Got questions? We've got answers. If you don't see what you're looking for, feel free to reach out to us directly.
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

function ContactPage() {
  return (
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">Contact Us</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            Have a question, special request, or need help with an order? We're here for you.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Mail, title: "Email", detail: "support@akihabaratcgwarehouse.com", sub: "We reply within 24 hours" },
              { icon: Clock, title: "Business Hours", detail: "Mon — Sat: 9AM — 6PM JST", sub: "Sunday: Closed" },
              { icon: MapPin, title: "Location", detail: "Akihabara, Tokyo", sub: "Japan" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-900/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-5 text-purple-900" />
                </div>
                <h3 className="font-semibold text-[14px] text-purple-900 mb-1">{item.title}</h3>
                <p className="text-[13px] text-gray-700">{item.detail}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-purple-900 mb-6">
              Send Us a Message
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

function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
            {isSignUp ? (
              /* Sign Up Form */
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Full Name</label>
                  <Input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Password</label>
                  <Input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                  <Input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <Button className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]">
                  Create Account
                </Button>
                <p className="text-[12px] text-gray-500 text-center mt-4">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            ) : (
              /* Sign In Form */
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-gray-700">Password</label>
                    <a href="#" className="text-[11px] text-violet-400 hover:underline">Forgot password?</a>
                  </div>
                  <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 text-[13px] border-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-gray-300" />
                  <label htmlFor="remember" className="text-[12px] text-gray-600">Remember me</label>
                </div>
                <Button className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]">
                  Sign In
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[12px] text-gray-500 text-center">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setEmail(""); setPassword(""); setName(""); setConfirmPassword(""); }}
                  className="text-violet-400 font-semibold hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 space-y-3">
            {[
              { icon: Shield, text: "Secure checkout with SSL encryption" },
              { icon: Truck, text: "Free shipping on orders over $500" },
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)"}}>
          <Button
            className="w-full bg-gradient-to-r from-purple-700 to-violet-600 text-white hover:from-purple-800 hover:to-violet-700 text-[11px] font-semibold shadow-md h-7 btn-gradient-cart"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="p-2.5" onClick={() => onOpen(product)}>
        <Badge variant="secondary" className="text-[9px] font-medium mb-1.5 bg-purple-900/5 text-purple-900 hover:bg-purple-900/10">
          {product.category}
        </Badge>
        <h3 className="text-[12px] sm:text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem]">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mb-1.5">
          {renderStars(product.rating ?? 0)}
          <span className="text-[10px] text-gray-400 ml-0.5">({product.rating ?? 0})</span>
        </div>
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

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 aspect-square bg-gray-50 shrink-0">
        <ProductImg src={product.image} alt={product.title} fill className="object-contain p-6" sizes="(max-width: 768px) 100vw, 50vw" />
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
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-[13px] font-medium text-green-600">
            In Stock
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

          <Button className="w-full bg-purple-950 hover:bg-purple-800 text-white font-semibold h-11 text-[14px]" onClick={handleAdd}>
            <ShoppingCart className="size-4 mr-2" />
            Add to Cart
          </Button>

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

function CheckoutPage({ cart, cartTotal, currency, navigateTo, clearCart }: {
  cart: CartItem[];
  cartTotal: number;
  currency: CurrencyCode;
  navigateTo: (page: PageView) => void;
  clearCart: () => void;
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

  const shippingCost = cartTotal >= 500 ? 0 : 15;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async () => {
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !shippingCity || !shippingCountry || !paymentMethod) return;

    setSubmitting(true);
    try {
      const orderId = "AKI-" + Date.now().toString(36).toUpperCase();

      // Try Supabase REST API first (zero SDK, zero Proxy — works on every browser)
      const { isSupabaseConfigured, createOrder, storeOrderLocally } = await import("@/lib/supabase-rest");

      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const orderData = {
        id: orderId,
        total: grandTotal,
        status: "pending",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_country: shippingCountry,
        shipping_zip: shippingZip,
        payment_method: paymentMethod,
        notes,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error } = await createOrder(orderData, orderItems);
        if (error) {
          alert(error || "Failed to place order. Please try again.");
          return;
        }
      } else {
        // No Supabase — store locally
        storeOrderLocally(orderData, orderItems);
      }

      setOrderId(orderId);
      setOrderPlaced(true);
      clearCart();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div>
        <section className="bg-purple-950 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg className="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-[14px] text-gray-200 max-w-xl mx-auto mb-2">
              Thank you for your order. Your order ID is:
            </p>
            <p className="text-2xl font-bold text-violet-300 mb-6">{orderId}</p>
            <p className="text-[13px] text-gray-300 max-w-md mx-auto mb-8">
              We&apos;ll send a confirmation to <span className="text-white font-medium">{customerEmail}</span>. You can also reach us on WhatsApp at <span className="text-white font-medium">+81 80-2935-0455</span> for any questions.
            </p>
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
            <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">Checkout</h1>
            <p className="text-[14px] text-gray-200">Your cart is empty.</p>
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
    <div>
      <section className="bg-purple-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-violet-300 tracking-[0.2em] uppercase mb-4">Secure Checkout</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Complete Your Order
          </h1>
          <p className="text-[14px] text-gray-200 max-w-xl mx-auto">
            Fill in your details below and choose your preferred payment method. All orders ship direct from Japan.
          </p>
        </div>
      </section>

      <section className="bg-violet-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
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
                  {[
                    { value: "bank_transfer", label: "Bank Transfer", desc: "Direct bank wire transfer", icon: "🏦" },
                    { value: "paypal", label: "PayPal", desc: "Pay with your PayPal account", icon: "🅿️" },
                    { value: "wise", label: "Wise (TransferWise)", desc: "Low-cost international transfer", icon: "💸" },
                    { value: "credit_card", label: "Credit / Debit Card", desc: "Visa, Mastercard, AMEX", icon: "💳" },
                    { value: "crypto", label: "Cryptocurrency", desc: "BTC, ETH, USDT", icon: "₿" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? "border-violet-400 bg-violet-400/5"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-0.5 accent-violet-400"
                      />
                      <div>
                        <span className="text-lg mr-1">{method.icon}</span>
                        <span className="text-[13px] font-semibold text-gray-900">{method.label}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{method.desc}</p>
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
                    <p className="text-[10px] text-gray-400">Free shipping on orders over {formatPrice(150, currency)}</p>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-[15px] font-bold">
                    <span>Total</span>
                    <span className="text-purple-900">{formatPrice(grandTotal, currency)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Send Order Button */}
                <Button
                  className="w-full bg-purple-950 hover:bg-purple-800 text-white font-bold h-12 text-[15px] rounded-lg"
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
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      Send Order
                    </span>
                  )}
                </Button>

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
