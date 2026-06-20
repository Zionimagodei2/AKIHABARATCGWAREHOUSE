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
  Instagram,
  Twitter,
  Youtube,
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
type PageView = "shop" | "about" | "shipping" | "faq" | "contact";

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

  return (
    <img
      src={imgError ? "/images/existing/ONE.jpg" : src}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className={className || ""}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" } : { width: width || "100%", height: height || "100%", objectFit: "contain" }}
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
  "Free Shipping on Orders Over $150",
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

  // Fetch products — apply 12% discount on fujicards products
  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const cleaned = data
          .filter((p) => p.id && p.title && p.price > 0 && p.image && p.category)
          .map((p) => {
            // Fujicards products: their price is the "original" price,
            // our site sells 12% cheaper
            if (p.source === "fujicards" && p.price > 0) {
              const fijiPrice = p.price; // This is what Fuji charges
              const ourPrice = Math.round(fijiPrice * 0.88 * 100) / 100; // 12% cheaper
              return {
                ...p,
                original_price: fijiPrice, // Show Fuji's price as "original" (crossed out)
                price: ourPrice,           // Our discounted price
                description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed. Order ${p.title} directly from Japan at unbeatable prices.`,
              };
            }
            // Existing products: price is already our price, original_price is the MSRP
            if (p.source === "existing" && p.original_price && p.original_price > p.price) {
              return {
                ...p,
                description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed.`,
              };
            }
            return {
              ...p,
              description: p.description || `Authentic Japanese TCG product. Brand new and factory sealed.`,
            };
          });
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
  }, [products, selectedCategory, searchQuery, sortOption]);

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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* ─── Announcement Bar ─── */}
      <div className="bg-[#0e252c] text-white overflow-hidden relative">
        <div className="animate-marquee flex whitespace-nowrap py-2.5">
          {[...ANNOUNCEMENT_MESSAGES, ...ANNOUNCEMENT_MESSAGES].map((msg, i) => (
            <span key={i} className="mx-10 text-[13px] font-light tracking-wide opacity-90">
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <button onClick={() => navigateTo("shop")} className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 bg-[#0e252c] rounded-lg flex items-center justify-center group-hover:bg-[#162f39] transition-colors">
                <Package className="size-5 text-[#13aff0]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[17px] font-extrabold font-[family-name:var(--font-montserrat)] text-[#0e252c] leading-none tracking-tight">
                  AKIHABARA
                </h1>
                <p className="text-[9px] font-bold text-[#13aff0] tracking-[0.25em] uppercase leading-none mt-0.5">
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
                      ? "text-[#0e252c] bg-gray-50"
                      : "text-gray-500 hover:text-[#0e252c] hover:bg-gray-50"
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
                  className="pl-9 w-40 lg:w-56 h-9 text-[13px] bg-gray-50 border-gray-200 focus:border-[#0e252c] focus:ring-[#0e252c]/10"
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
                          ? "text-[#0e252c] bg-gray-50"
                          : "text-gray-500 hover:text-[#0e252c] hover:bg-gray-50"
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
        {currentPage === "shop" && <ShopPage products={products} loading={loading} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} sortOption={sortOption} setSortOption={setSortOption} currency={currency} filteredProducts={filteredProducts} openProductModal={openProductModal} addToCart={addToCart} heroIndex={heroIndex} setHeroIndex={setHeroIndex} scrollToSection={scrollToSection} />}
        {currentPage === "about" && <AboutPage />}
        {currentPage === "shipping" && <ShippingPage />}
        {currentPage === "faq" && <FAQPage />}
        {currentPage === "contact" && <ContactPage />}
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0e252c] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Column 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 bg-[#13aff0] rounded-lg flex items-center justify-center">
                  <Package className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold font-[family-name:var(--font-montserrat)] text-white text-[15px] leading-none">
                    AKIHABARA
                  </h3>
                  <p className="text-[8px] font-bold text-[#13aff0] tracking-[0.25em] uppercase leading-none mt-0.5">
                    TCG Warehouse
                  </p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-gray-400 mb-5 max-w-xs">
                Your trusted source for authentic Japanese Pokémon TCG, One Piece, and more. Every product ships direct from Japan, sealed and verified.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-[#13aff0]/20 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="size-4 text-gray-400 hover:text-[#13aff0]" />
                </a>
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-[#13aff0]/20 flex items-center justify-center transition-colors" aria-label="Twitter">
                  <Twitter className="size-4 text-gray-400 hover:text-[#13aff0]" />
                </a>
                <a href="#" className="w-9 h-9 rounded-md bg-white/5 hover:bg-[#13aff0]/20 flex items-center justify-center transition-colors" aria-label="YouTube">
                  <Youtube className="size-4 text-gray-400 hover:text-[#13aff0]" />
                </a>
              </div>
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
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigateTo(link.page)}
                      className="text-[13px] text-gray-400 hover:text-[#13aff0] transition-colors"
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
                      className="text-[13px] text-gray-400 hover:text-[#13aff0] transition-colors"
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
                  <Mail className="size-4 text-[#13aff0] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-300">support@akihabara-tcg.com</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">We reply within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-[#13aff0] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-300">Mon — Sat: 9AM — 6PM JST</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Sunday: Closed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-[#13aff0] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-gray-300">Akihabara, Tokyo</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Japan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[11px] text-gray-500">
                &copy; {new Date().getFullYear()} Akihabara TCG Warehouse. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Shield className="size-3.5" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <CreditCard className="size-3.5" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
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
            className="fixed bottom-6 right-6 z-50 bg-[#0e252c] hover:bg-[#13aff0] text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-white p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2 font-[family-name:var(--font-montserrat)] text-[15px]">
              <ShoppingCart className="size-5" />
              Your Cart
              {cartItemCount > 0 && (
                <Badge className="bg-[#0e252c] text-white border-0 text-[10px] font-bold">{cartItemCount}</Badge>
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
              <Button className="mt-4 bg-[#0e252c] hover:bg-[#162f39] text-white text-[13px]" onClick={() => setCartOpen(false)}>
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
                        <p className="text-[12px] font-medium text-[#0e252c] truncate">{item.product.title}</p>
                        <p className="text-[13px] font-bold text-[#0e252c] mt-1">{formatPrice(item.product.price, currency)}</p>
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
                  <span className="text-lg font-bold text-[#0e252c]">{formatPrice(cartTotal, currency)}</span>
                </div>
                {cartTotal < 150 && (
                  <p className="text-[11px] text-gray-400 text-center">
                    Add {formatPrice(150 - cartTotal, currency)} more for free shipping
                  </p>
                )}
                {cartTotal >= 150 && (
                  <p className="text-[11px] text-green-600 text-center font-medium">
                    You qualify for free shipping!
                  </p>
                )}
                <Button className="w-full bg-[#0e252c] hover:bg-[#162f39] text-white font-semibold h-11 text-[14px]">
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
          {selectedProduct && (
            <ProductDetailModal product={selectedProduct} currency={currency} onClose={() => setProductModalOpen(false)} onAddToCart={addToCart} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────── Shop Page ─────────── */

function ShopPage({ products, loading, selectedCategory, setSelectedCategory, searchQuery, sortOption, setSortOption, currency, filteredProducts, openProductModal, addToCart, heroIndex, setHeroIndex, scrollToSection }: {
  products: Product[]; loading: boolean; selectedCategory: string; setSelectedCategory: (v: string) => void;
  searchQuery: string; sortOption: SortOption; setSortOption: (v: SortOption) => void;
  currency: CurrencyCode; filteredProducts: Product[];
  openProductModal: (p: Product) => void; addToCart: (p: Product) => void;
  heroIndex: number; setHeroIndex: (v: number) => void;
  scrollToSection: (id: string) => void;
}) {
  return (
    <>
      {/* Hero Section */}
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
                <ProductImg src={HERO_SLIDES[heroIndex].image} alt={HERO_SLIDES[heroIndex].title} fill className="object-cover" priority={heroIndex === 0} sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0e252c]/90 via-[#0e252c]/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                  <div className="max-w-lg">
                    <p className="mb-3 text-[11px] font-bold text-[#13aff0] tracking-[0.15em] uppercase">
                      {HERO_SLIDES[heroIndex].accent}
                    </p>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-3">
                      {HERO_SLIDES[heroIndex].title}
                    </h2>
                    <p className="text-[13px] sm:text-[15px] text-gray-300 mb-5 max-w-md leading-relaxed">
                      {HERO_SLIDES[heroIndex].subtitle}
                    </p>
                    <Button onClick={() => scrollToSection("products")} className="bg-[#0e252c] hover:bg-[#162f39] text-white font-semibold px-6 text-[13px] border border-white/20">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => setHeroIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2 text-white transition-colors" aria-label="Previous slide">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-2 text-white transition-colors" aria-label="Next slide">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)} className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-8 h-2.5 bg-[#13aff0]" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "100% Authentic", desc: "Verified products" },
              { icon: Truck, label: "Free Shipping", desc: "Orders over $150" },
              { icon: Globe, label: "Worldwide", desc: "Secure delivery" },
              { icon: Package, label: "Direct from Japan", desc: "Trusted suppliers" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 justify-center py-2">
                <div className="w-10 h-10 rounded-lg bg-[#0e252c]/5 flex items-center justify-center shrink-0">
                  <badge.icon className="size-5 text-[#0e252c]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0e252c]">{badge.label}</p>
                  <p className="text-[11px] text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c]">
              Our Collection
            </h2>
            <p className="text-[12px] text-gray-500 mt-1">
              {filteredProducts.length} products
              {selectedCategory !== "all" && ` in ${CATEGORY_TABS.find((t) => t.key === selectedCategory)?.label}`}
            </p>
          </div>
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

        {/* Category Tabs */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-2 min-w-max">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
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
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
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
            <h3 className="text-[16px] font-semibold text-gray-500">No products found</h3>
            <p className="text-[13px] text-gray-400 mt-1">Try adjusting your search or category filter</p>
            <Button variant="outline" className="mt-4 text-[13px]" onClick={() => { /* clear filters handled by parent */ }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} currency={currency} onOpen={openProductModal} onAddToCart={addToCart} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#0e252c] text-white py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-4">
              Trusted Worldwide
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-4">
              Why Choose Akihabara TCG Warehouse
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-[14px] leading-relaxed">
              Your premier source for authentic Japanese Pokémon Trading Card Game products. Whether you're a seasoned collector, a competitive player, or running a card business, we've got you covered.
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
                <div className="w-11 h-11 rounded-lg bg-[#13aff0]/15 flex items-center justify-center mb-4">
                  <item.icon className="size-5 text-[#13aff0]" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{item.title}</h3>
                <p className="text-gray-400 text-[13px] leading-relaxed">{item.desc}</p>
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
                  <h4 className="font-semibold text-[#13aff0] text-[14px] mb-1">{item.title}</h4>
                  <p className="text-[12px] text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
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
      <section className="bg-[#0e252c] py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-4">About Us</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-montserrat)] text-white leading-tight mb-6">
            Trusted Worldwide for Japanese Pokémon TCG
          </h1>
          <p className="text-[15px] text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to Akihabara TCG Warehouse, your premier source for authentic Japanese Pokémon Trading Card Game products. Whether you're a seasoned collector, a competitive player, or running a card business, we offer genuine Pokémon TCG items straight from Japan — always at unbeatable wholesale prices.
          </p>
        </div>
      </section>

      {/* Our Purpose */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-3">Our Purpose</p>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] mb-4">
                Connecting fans with the cards they love
              </h2>
              <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                We're here to connect fans around the globe with the most exciting and hard-to-find Japanese Pokémon cards. Our focus is to make every order secure, every card legitimate, and every customer experience smooth and satisfying.
              </p>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Based in the heart of Akihabara, Tokyo's legendary electronics and hobby district, we have direct access to the newest releases, rarest finds, and best prices. We pass those savings on to you.
              </p>
            </div>
            <div className="bg-[#0e252c]/5 rounded-2xl p-8">
              <h3 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] mb-6">
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
                    <div className="w-9 h-9 rounded-lg bg-[#13aff0]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="size-4 text-[#13aff0]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#0e252c]">{item.title}</p>
                      <p className="text-[12px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="py-16 bg-[#f5f5f0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-3">What We Carry</p>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c]">
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
                <div className="w-12 h-12 rounded-full bg-[#0e252c]/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-5 text-[#0e252c]" />
                </div>
                <h3 className="font-semibold text-[14px] text-[#0e252c] mb-2">{item.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#13aff0]/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="size-7 text-[#13aff0]" />
          </div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] mb-4">
            Our Guarantee to You
          </h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
            At Akihabara TCG Warehouse, we stand by the integrity of every product. We strictly avoid counterfeits and resealed packs — your satisfaction and trust are our top priorities.
          </p>
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Join the growing number of international customers who rely on us for safe, affordable access to Japanese Pokémon cards. Begin your journey or expand your inventory today.
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
      <section className="bg-[#0e252c] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-4">Shipping Policy</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-[14px] text-gray-300 max-w-xl mx-auto">
            We ship worldwide from Tokyo, Japan. Here's everything you need to know about how your order gets to you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {[
            {
              title: "Free Shipping Threshold",
              content: "Orders over $150 qualify for free standard international shipping. This is automatically applied at checkout — no coupon needed.",
            },
            {
              title: "Shipping Methods & Times",
              content: "We offer two primary shipping methods:\n\n• Standard International (10–21 business days) — Free on orders over $150, otherwise calculated at checkout.\n• Express International (5–10 business days) — Available at an additional cost. Select at checkout.\n\nPlease note: delivery times are estimates and may vary depending on your country's customs processing.",
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
              <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] mb-3">
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
      a: "Yes! We offer competitive wholesale pricing on bulk orders and sealed cases. Contact us at support@akihabara-tcg.com with details about what you need and we'll send you a custom quote.",
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
      <section className="bg-[#0e252c] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-4">FAQ</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[14px] text-gray-300 max-w-xl mx-auto">
            Got questions? We've got answers. If you don't see what you're looking for, feel free to reach out to us directly.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-[14px] font-semibold text-[#0e252c] pr-4 group-hover:text-[#13aff0] transition-colors">
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
      <section className="bg-[#0e252c] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold text-[#13aff0] tracking-[0.2em] uppercase mb-4">Contact Us</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-montserrat)] text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-[14px] text-gray-300 max-w-xl mx-auto">
            Have a question, special request, or need help with an order? We're here for you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Mail, title: "Email", detail: "support@akihabara-tcg.com", sub: "We reply within 24 hours" },
              { icon: Clock, title: "Business Hours", detail: "Mon — Sat: 9AM — 6PM JST", sub: "Sunday: Closed" },
              { icon: MapPin, title: "Location", detail: "Akihabara, Tokyo", sub: "Japan" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0e252c]/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="size-5 text-[#0e252c]" />
                </div>
                <h3 className="font-semibold text-[14px] text-[#0e252c] mb-1">{item.title}</h3>
                <p className="text-[13px] text-gray-700">{item.detail}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] mb-6">
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
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0e252c]/10 focus:border-[#0e252c]"
                />
              </div>
              <Button className="bg-[#0e252c] hover:bg-[#162f39] text-white font-semibold px-6 text-[13px] h-10">
                Send Message
              </Button>
            </div>
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
  const discount = getDiscountPercent(product.original_price ?? 0, product.price);
  const isOnSale = discount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 group cursor-pointer"
    >
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden" onClick={() => onOpen(product)}>
        <ProductImg src={product.image} alt={product.title} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            className="w-full bg-white text-[#0e252c] hover:bg-gray-100 text-[12px] font-semibold"
            disabled={product.in_stock === false}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            {product.in_stock !== false ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>

      <div className="p-4" onClick={() => onOpen(product)}>
        <Badge variant="secondary" className="text-[9px] font-medium mb-2 bg-[#0e252c]/5 text-[#0e252c] hover:bg-[#0e252c]/10">
          {product.category}
        </Badge>
        <h3 className="text-[13px] font-semibold text-[#0e252c] line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.rating ?? 0)}
          <span className="text-[11px] text-gray-400 ml-1">({product.rating ?? 0})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-[#0e252c]">
            {formatPrice(product.price, currency)}
          </span>
          {isOnSale && (
            <span className="text-[12px] text-gray-400 line-through">
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
  const discount = getDiscountPercent(product.original_price ?? 0, product.price);
  const isOnSale = discount > 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 aspect-square bg-gray-50 shrink-0">
        <ProductImg src={product.image} alt={product.title} fill className="object-contain p-6" sizes="(max-width: 768px) 100vw, 50vw" />
        {isOnSale && (
          <Badge className="absolute top-4 left-4 bg-[#cb2027] text-white border-0 font-bold text-[12px]">
            -{discount}% OFF
          </Badge>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <DialogHeader className="text-left p-0 mb-4">
          <Badge variant="secondary" className="text-[10px] font-medium mb-2 w-fit bg-[#0e252c]/5 text-[#0e252c]">
            {product.category}
          </Badge>
          <DialogTitle className="text-[18px] font-bold font-[family-name:var(--font-montserrat)] text-[#0e252c] leading-snug">
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
          <span className="text-2xl font-bold text-[#0e252c]">{formatPrice(product.price, currency)}</span>
          {isOnSale && (
            <span className="text-[14px] text-gray-400 line-through">{formatPrice(product.original_price ?? 0, currency)}</span>
          )}
          {isOnSale && (
            <Badge className="bg-[#cb2027] text-white border-0 text-[11px] font-bold">
              Save {formatPrice((product.original_price ?? 0) - product.price, currency)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2.5 h-2.5 rounded-full ${product.in_stock !== false ? "bg-green-500" : "bg-gray-400"}`} />
          <span className={`text-[13px] font-medium ${product.in_stock !== false ? "text-green-600" : "text-gray-500"}`}>
            {product.in_stock !== false ? "In Stock" : "Out of Stock"}
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

          <Button className="w-full bg-[#0e252c] hover:bg-[#162f39] text-white font-semibold h-11 text-[14px]" disabled={product.in_stock === false} onClick={handleAdd}>
            <ShoppingCart className="size-4 mr-2" />
            {product.in_stock !== false ? "Add to Cart" : "Out of Stock"}
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
