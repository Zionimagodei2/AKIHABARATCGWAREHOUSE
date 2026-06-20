"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  categories?: string[];
  rating?: number;
  in_stock?: boolean;
  source?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type CurrencyCode = "USD" | "JPY" | "EUR" | "GBP";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating";

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
        onError={() => setImgError(true)}
      />
    );
  }

  // For remote images or errored local images, use <img> with referrerPolicy
  return (
    <img
      src={imgError ? "/images/existing/ONE.jpg" : src}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className={className?.replace("object-contain", "object-contain").replace("object-cover", "object-cover") || ""}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : { width: width || "100%", height: height || "100%" }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== window.location.origin + "/images/existing/ONE.jpg") {
          target.src = "/images/existing/ONE.jpg";
        }
      }}
      loading={priority ? "eager" : "lazy"}
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
  { key: "Japanese Pokemon Cards", label: "Japanese Pokémon" },
  { key: "English Pokemon Cards", label: "English Pokémon" },
  { key: "One Piece", label: "One Piece" },
  { key: "Dragon Ball", label: "Dragon Ball" },
  { key: "Weiss Schwarz", label: "Weiss Schwarz" },
  { key: "Union Arena", label: "Union Arena" },
  { key: "Gundam Card Game", label: "Gundam" },
  { key: "Disney Lorcana", label: "Lorcana" },
];

const HERO_SLIDES = [
  {
    image: "/images/existing/shiny-japanese-charizard-ex-pokemon-tcg-card-art-1024x512.avif",
    title: "Japanese Pokémon TCG",
    subtitle: "Direct from Akihabara — Authentic & Sealed",
    accent: "New Arrivals",
  },
  {
    image: "/images/existing/a-vstar-universe-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif",
    title: "VSTAR Universe",
    subtitle: "Rare pulls & exclusive artwork from Japan",
    accent: "Limited Stock",
  },
  {
    image: "/images/existing/a-ruler-of-the-black-flame-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif",
    title: "Ruler of the Black Flame",
    subtitle: "Charizard ex & more — Sealed Booster Boxes",
    accent: "Hot",
  },
  {
    image: "/images/existing/a-snow-hazard-booster-pack-from-the-japanese-pokemon-tcg-1024x512.avif",
    title: "Snow Hazard Collection",
    subtitle: "Complete your Japanese set before they're gone",
    accent: "Sale",
  },
];

const ANNOUNCEMENT_MESSAGES = [
  "🚚 Free Shipping on Orders Over $150",
  "🇯🇵 Direct from Japan — 100% Authentic",
  "🌍 Ships Worldwide — Secure Packaging",
  "⭐ Trusted by Thousands of Collectors",
  "🔒 Guaranteed Authenticity on Every Item",
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
      stars.push(
        <Star key={i} className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <div key={i} className="relative">
          <Star className="size-3.5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
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
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  // Fetch products
  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data: Product[]) => {
        // Filter out garbage/scraped entries and products missing critical fields
        const cleaned = data.filter(
          (p) =>
            p.id &&
            p.title &&
            p.price > 0 &&
            p.image &&
            p.category
        );
        setProducts(cleaned);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          (p.categories && p.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())) ||
          (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortOption) {
      case "price-asc":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortOption]);

  // Cart operations
  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const openProductModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  }, []);

  /* ─────────── Render ─────────── */

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* ─── Announcement Bar ─── */}
      <div className="bg-[#0e252c] text-white overflow-hidden relative">
        <div className="animate-marquee flex whitespace-nowrap py-2">
          {[...ANNOUNCEMENT_MESSAGES, ...ANNOUNCEMENT_MESSAGES].map(
            (msg, i) => (
              <span
                key={i}
                className="mx-8 text-sm font-medium tracking-wide opacity-90"
              >
                {msg}
              </span>
            )
          )}
        </div>
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-[#0e252c] rounded-lg flex items-center justify-center">
                <Package className="size-5 text-[#13aff0]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] leading-tight tracking-tight">
                  AKIHABARA
                </h1>
                <p className="text-[10px] font-semibold text-[#13aff0] tracking-[0.2em] uppercase leading-none">
                  TCG Warehouse
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {[
                { label: "Shop", id: "products" },
                { label: "About", id: "about" },
                { label: "Shipping", id: "about" },
                { label: "FAQ", id: "about" },
                { label: "Contact", id: "footer" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-gray-600 hover:text-[#13aff0] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side: Search + Currency + Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-40 lg:w-56 h-9 text-sm bg-gray-50 border-gray-200 focus:border-[#13aff0] focus:ring-[#13aff0]/20"
                />
              </div>

              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => {
                  const el = document.getElementById("mobile-search");
                  if (el) el.classList.toggle("hidden");
                }}
              >
                <Search className="size-5" />
              </Button>

              {/* Currency Selector */}
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as CurrencyCode)}
              >
                <SelectTrigger className="w-[72px] h-9 text-xs font-semibold border-gray-200 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="JPY">JPY ¥</SelectItem>
                  <SelectItem value="EUR">EUR €</SelectItem>
                  <SelectItem value="GBP">GBP £</SelectItem>
                </SelectContent>
              </Select>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label="Open shopping cart"
              >
                <ShoppingCart className="size-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#cb2027] text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Button>

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full h-9 text-sm bg-gray-50 border-gray-200"
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
                <div className="py-3 space-y-1">
                  {[
                    { label: "Shop", id: "products" },
                    { label: "About", id: "about" },
                    { label: "Shipping", id: "about" },
                    { label: "FAQ", id: "about" },
                    { label: "Contact", id: "footer" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.id)}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#13aff0] hover:bg-gray-50 rounded-md transition-colors"
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
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden bg-[#0e252c]">
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
                  <ProductImg
                    src={HERO_SLIDES[heroIndex].image}
                    alt={HERO_SLIDES[heroIndex].title}
                    fill
                    className="object-cover"
                    priority={heroIndex === 0}
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0e252c]/90 via-[#0e252c]/60 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                    <div className="max-w-lg">
                      <Badge className="mb-3 bg-[#13aff0] text-white border-0 text-xs font-bold px-3 py-1">
                        {HERO_SLIDES[heroIndex].accent}
                      </Badge>
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-3">
                        {HERO_SLIDES[heroIndex].title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-300 mb-5 max-w-md">
                        {HERO_SLIDES[heroIndex].subtitle}
                      </p>
                      <Button
                        onClick={() => scrollToSection("products")}
                        className="bg-[#13aff0] hover:bg-[#0e9ad8] text-white font-semibold px-6"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Hero Nav Arrows */}
              <button
                onClick={() =>
                  setHeroIndex(
                    (prev) =>
                      (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() =>
                  setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2 text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="size-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === heroIndex
                        ? "w-8 h-2.5 bg-[#13aff0]"
                        : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust Badges ─── */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "100% Authentic", desc: "Verified products" },
                { icon: Truck, label: "Free Shipping", desc: "Orders over $150" },
                { icon: Globe, label: "Worldwide", desc: "Secure delivery" },
                { icon: Package, label: "Direct from Japan", desc: "Trusted suppliers" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-3 justify-center py-2"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0e252c]/5 flex items-center justify-center shrink-0">
                    <badge.icon className="size-5 text-[#0e252c]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0e252c]">
                      {badge.label}
                    </p>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Products Section ─── */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c]">
                Our Collection
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} products
                {selectedCategory !== "all" && ` in ${CATEGORY_TABS.find((t) => t.key === selectedCategory)?.label}`}
              </p>
            </div>
            <Select
              value={sortOption}
              onValueChange={(v) => setSortOption(v as SortOption)}
            >
              <SelectTrigger className="w-44 h-9 text-sm border-gray-200 bg-white">
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

          {/* Category Tabs */}
          <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
            <div className="flex gap-2 pb-2 min-w-max">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === tab.key
                      ? "bg-[#0e252c] text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="aspect-[4/5] animate-shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-shimmer w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-shimmer w-1/2" />
                    <div className="h-8 bg-gray-200 rounded animate-shimmer w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="size-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">
                No products found
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or category filter
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={currency}
                    onOpen={openProductModal}
                    onAddToCart={addToCart}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ─── About Section ─── */}
        <section
          id="about"
          className="bg-[#0e252c] text-white py-16 mt-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-[#13aff0]/20 text-[#13aff0] border-0 mb-4 text-xs font-bold px-3 py-1">
                🏆 TRUSTED WORLDWIDE
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-montserrat)] mb-4">
                Why Choose Akihabara TCG Warehouse
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Your premier source for authentic Japanese Pokémon Trading Card
                Game products. Whether you&apos;re a seasoned collector, a
                competitive player, or running a card business.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Guaranteed Authenticity",
                  desc: "Every item we sell is verified through trusted third-party channels. No counterfeits, ever.",
                },
                {
                  icon: Globe,
                  title: "Direct from Japan",
                  desc: "We work closely with Japanese suppliers to bring you exclusive releases and rare cards.",
                },
                {
                  icon: Package,
                  title: "Wholesale & Individual",
                  desc: "Whether you're buying one box or a pallet, we've got you covered at unbeatable prices.",
                },
                {
                  icon: Truck,
                  title: "Careful, Fast Delivery",
                  desc: "Secure packaging and prompt worldwide shipping ensure your order arrives safely.",
                },
                {
                  icon: Heart,
                  title: "Reliable Support",
                  desc: "Need assistance? Our support team is available 24/7 to guide and assist you.",
                },
                {
                  icon: Star,
                  title: "Our Guarantee",
                  desc: "We strictly avoid counterfeits and resealed packs — your satisfaction and trust are our top priorities.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#13aff0]/20 flex items-center justify-center mb-4">
                    <item.icon className="size-6 text-[#13aff0]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Collection includes */}
            <div className="mt-12 bg-white/5 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold font-[family-name:var(--font-montserrat)] mb-6 text-center">
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
                    <h4 className="font-semibold text-[#13aff0] mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer
        id="footer"
        className="bg-[#0a1a20] text-gray-400 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#13aff0] rounded-lg flex items-center justify-center">
                  <Package className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-[family-name:var(--font-montserrat)] text-white text-sm leading-tight">
                    AKIHABARA
                  </h3>
                  <p className="text-[9px] font-semibold text-[#13aff0] tracking-[0.2em] uppercase leading-none">
                    TCG Warehouse
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Your premier source for authentic Japanese TCG products. Direct
                from Japan, 100% authentic, ships worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["Shop", "About", "Shipping", "FAQ", "Contact"].map(
                  (link) => (
                    <li key={link}>
                      <button
                        onClick={() =>
                          scrollToSection(
                            link === "Shop"
                              ? "products"
                              : link === "Contact"
                              ? "footer"
                              : "about"
                          )
                        }
                        className="text-sm hover:text-[#13aff0] transition-colors"
                      >
                        {link}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">
                Categories
              </h4>
              <ul className="space-y-2">
                {CATEGORY_TABS.slice(1, 7).map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => {
                        setSelectedCategory(tab.key);
                        scrollToSection("products");
                      }}
                      className="text-sm hover:text-[#13aff0] transition-colors"
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">
                Contact Us
              </h4>
              <div className="space-y-2 text-sm">
                <p>📧 support@akihabara-tcg.com</p>
                <p>🌐 Worldwide Shipping</p>
                <p>💬 24/7 Support</p>
              </div>
              <div className="flex gap-3 mt-4">
                {["X", "IG", "YT", "DC"].map((social) => (
                  <div
                    key={social}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#13aff0]/20 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-400 hover:text-[#13aff0]">
                      {social}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>
              © {new Date().getFullYear()} Akihabara TCG Warehouse. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <span className="hover:text-gray-300 cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-gray-300 cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-gray-300 cursor-pointer">
                Refund Policy
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Scroll to Top ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 bg-[#0e252c] hover:bg-[#13aff0] text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Cart Sidebar ─── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col bg-white p-0"
        >
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2 font-[family-name:var(--font-montserrat)]">
              <ShoppingCart className="size-5" />
              Shopping Cart
              {cartItemCount > 0 && (
                <Badge className="bg-[#13aff0] text-white border-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              {cart.length === 0
                ? "Your cart is empty"
                : `${cartItemCount} item${cartItemCount > 1 ? "s" : ""} in your cart`}
            </SheetDescription>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="size-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No items yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start adding products to your cart
              </p>
              <Button
                className="mt-4 bg-[#13aff0] hover:bg-[#0e9ad8] text-white"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-gray-50 rounded-lg p-3"
                    >
                      <div className="w-16 h-20 rounded-md overflow-hidden shrink-0 bg-gray-200">
                        <ProductImg
                          src={item.product.image}
                          alt={item.product.title}
                          width={64}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0e252c] truncate">
                          {item.product.title}
                        </p>
                        <p className="text-sm font-bold text-[#13aff0] mt-1">
                          {formatPrice(item.product.price, currency)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() =>
                              updateCartQuantity(item.product.id, -1)
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() =>
                              updateCartQuantity(item.product.id, 1)
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 ml-auto text-[#cb2027] hover:text-[#cb2027] hover:bg-[#cb2027]/10"
                            onClick={() => removeFromCart(item.product.id)}
                          >
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
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-[#0e252c]">
                    {formatPrice(cartTotal, currency)}
                  </span>
                </div>
                {cartTotal < 150 && (
                  <p className="text-xs text-gray-400 text-center">
                    Add {formatPrice(150 - cartTotal, currency)} more for free
                    shipping!
                  </p>
                )}
                {cartTotal >= 150 && (
                  <p className="text-xs text-green-600 text-center font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                )}
                <Button className="w-full bg-[#13aff0] hover:bg-[#0e9ad8] text-white font-semibold h-11">
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Product Detail Modal ─── */}
      <Dialog
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              currency={currency}
              onClose={() => setProductModalOpen(false)}
              onAddToCart={addToCart}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────── Sub-Components ─────────── */

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
  const discount = getDiscountPercent(product.original_price ?? 0, product.price);
  const isOnSale = discount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="product-card bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group cursor-pointer"
    >
      {/* Image */}
      <div
        className="relative aspect-[4/5] bg-gray-50 overflow-hidden"
        onClick={() => onOpen(product)}
      >
        <ProductImg
          src={product.image}
          alt={product.title}
          fill
          className="product-card-image object-contain p-2"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {isOnSale && (
            <Badge className="bg-[#cb2027] text-white border-0 text-[10px] font-bold px-2 py-0.5">
              -{discount}%
            </Badge>
          )}
          {product.in_stock === false && (
            <Badge className="bg-gray-800 text-white border-0 text-[10px] font-bold px-2 py-0.5">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            className="w-full bg-[#13aff0] hover:bg-[#0e9ad8] text-white text-sm font-semibold"
            disabled={product.in_stock === false}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            {product.in_stock !== false ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4" onClick={() => onOpen(product)}>
        {/* Category badge */}
        <Badge
          variant="secondary"
          className="text-[10px] font-medium mb-2 bg-[#0e252c]/5 text-[#0e252c] hover:bg-[#0e252c]/10"
        >
          {product.category}
        </Badge>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#0e252c] line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.rating ?? 0)}
          <span className="text-xs text-gray-400 ml-1">
            ({product.rating ?? 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#0e252c]">
            {formatPrice(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.original_price ?? 0, currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
  const discount = getDiscountPercent(product.original_price ?? 0, product.price);
  const isOnSale = discount > 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Image */}
      <div className="relative w-full md:w-1/2 aspect-square bg-gray-50 shrink-0">
        <ProductImg
          src={product.image}
          alt={product.title}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {isOnSale && (
          <Badge className="absolute top-4 left-4 bg-[#cb2027] text-white border-0 font-bold">
            -{discount}% OFF
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-6 flex flex-col">
        <DialogHeader className="text-left p-0 mb-4">
          <Badge
            variant="secondary"
            className="text-xs font-medium mb-2 w-fit bg-[#0e252c]/5 text-[#0e252c]"
          >
            {product.category}
          </Badge>
          <DialogTitle className="text-xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] leading-snug">
            {product.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Product details for {product.title}
          </DialogDescription>
        </DialogHeader>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {renderStars(product.rating ?? 0)}
          </div>
          <span className="text-sm font-medium text-gray-600">
            {product.rating ?? 0} / 5
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-bold text-[#0e252c]">
            {formatPrice(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(product.original_price ?? 0, currency)}
            </span>
          )}
          {isOnSale && (
            <Badge className="bg-[#cb2027] text-white border-0 text-xs font-bold">
              Save {formatPrice((product.original_price ?? 0) - product.price, currency)}
            </Badge>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              product.in_stock !== false ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              product.in_stock !== false ? "text-green-600" : "text-gray-500"
            }`}
          >
            {product.in_stock !== false ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {product.description || 'No description available.'}
        </p>

        {/* Quantity + Add to Cart */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Qty:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-[#13aff0] hover:bg-[#0e9ad8] text-white font-semibold h-12 text-base"
            disabled={product.in_stock === false}
            onClick={handleAdd}
          >
            <ShoppingCart className="size-5 mr-2" />
            {product.in_stock !== false ? "Add to Cart" : "Out of Stock"}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Shield className="size-3.5" />
              <span>Authentic</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Truck className="size-3.5" />
              <span>Fast Ship</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Globe className="size-3.5" />
              <span>Worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
