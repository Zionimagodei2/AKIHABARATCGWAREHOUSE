"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  Eye,
  ChevronRight,
  CheckCircle2,
  XCircle,
  StarHalf,
  MoreVertical,
  ArrowUpDown,
  RefreshCw,
  Filter,
  ImagePlus,
  GripVertical,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Link,
  Hash,
  CloudUpload,
  Github,
  Copy,
  Download,
  Upload,
  Zap,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
// Self-contained store database — works on the static deployment (no server
// needed). Edits live in a localStorage overlay and are published to the
// GitHub repo, which triggers the store rebuild (see @/lib/admin-store).
import {
  adminStore,
  type PublishStatus as StorePublishStatus,
  type StoreProduct,
  type StoreContent,
} from "@/lib/admin-store";

/* ─────────── Types ─────────── */

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  description: string | null;
  category: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  source: string | null;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string | null;
  product?: { id: string; title: string; image: string } | null;
}

interface Order {
  id: string;
  userId: string | null;
  user?: { id: string; name: string; email: string; phone?: string } | null;
  items: OrderItem[];
  total: number;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingZip: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerDetail extends Customer {
  orders: Order[];
}

interface Review {
  id: string;
  productId: string | null;
  userId: string | null;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string | null;
  approved: boolean;
  createdAt: string;
  product?: { id: string; title: string; image: string } | null;
  user?: { id: string; name: string; email: string } | null;
}

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  accent: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  id: string;
  message: string;
  active: boolean;
  order: number;
}

type Page = "dashboard" | "products" | "orders" | "customers" | "reviews" | "content" | "settings";

/* ─────────── Constants ─────────── */

const NAV_ITEMS: { key: Page; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "customers", label: "Customers", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "content", label: "Content", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

/* ─────────── API ↔ Frontend Mappers ─────────── */

function mapProductFromApi(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    title: row.title as string,
    price: row.price as number,
    originalPrice: (row.originalPrice as number) ?? (row.original_price as number) ?? null,
    image: row.image as string,
    images: safeParseJSON(row.images),
    description: (row.description as string) ?? null,
    category: row.category as string,
    categories: safeParseJSON(row.categories),
    rating: (row.rating as number) ?? 4.5,
    reviewCount: (row.reviewCount as number) ?? (row.review_count as number) ?? 0,
    inStock: (row.inStock as boolean) ?? (row.in_stock as boolean) ?? true,
    featured: (row.featured as boolean) ?? false,
    source: (row.source as string) ?? null,
    sku: (row.sku as string) ?? null,
    createdAt: (row.createdAt as string) ?? (row.created_at as string) ?? "",
    updatedAt: (row.updatedAt as string) ?? (row.updated_at as string) ?? "",
  };
}

function mapOrderFromApi(row: Record<string, unknown>): Order {
  const rawItems = (row.items as Record<string, unknown>[]) ?? (row.order_items as Record<string, unknown>[]) ?? [];
  const items = rawItems.map((item: Record<string, unknown>) => ({
    id: item.id as string,
    title: item.title as string,
    price: item.price as number,
    quantity: (item.quantity as number) ?? 1,
    image: (item.image as string) ?? null,
  }));
  return {
    id: row.id as string,
    userId: (row.userId as string) ?? (row.user_id as string) ?? null,
    items,
    total: row.total as number,
    status: row.status as string,
    customerName: (row.customerName as string) ?? (row.customer_name as string) ?? null,
    customerEmail: (row.customerEmail as string) ?? (row.customer_email as string) ?? null,
    customerPhone: (row.customerPhone as string) ?? (row.customer_phone as string) ?? null,
    shippingAddress: (row.shippingAddress as string) ?? (row.shipping_address as string) ?? null,
    shippingCity: (row.shippingCity as string) ?? (row.shipping_city as string) ?? null,
    shippingCountry: (row.shippingCountry as string) ?? (row.shipping_country as string) ?? null,
    shippingZip: (row.shippingZip as string) ?? (row.shipping_zip as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: (row.createdAt as string) ?? (row.created_at as string) ?? "",
    updatedAt: (row.updatedAt as string) ?? (row.updated_at as string) ?? "",
  };
}

function mapHeroSlideFromApi(row: Record<string, unknown>): HeroSlide {
  return {
    id: row.id as string,
    image: row.image as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    accent: row.accent as string,
    order: (row.order as number) ?? 0,
    active: (row.active as boolean) ?? true,
    createdAt: (row.createdAt as string) ?? (row.created_at as string) ?? "",
    updatedAt: (row.updatedAt as string) ?? (row.updated_at as string) ?? "",
  };
}

function mapAnnouncementFromApi(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    message: row.message as string,
    active: (row.active as boolean) ?? true,
    order: (row.order as number) ?? 0,
  };
}

/** Map a locally-stored review (admin-store format) to the UI shape. */
function mapReviewFromLocal(r: {
  id: string;
  productId: string | null;
  author: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
  createdAt: string;
}): Review {
  const product = r.productId ? adminStore.getProduct(r.productId) : undefined;
  return {
    id: r.id,
    productId: r.productId,
    userId: null,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    avatar: null,
    approved: r.approved,
    createdAt: r.createdAt,
    product: product ? { id: product.id, title: product.title, image: product.image } : null,
  };
}

function safeParseJSON(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* ─────────── Helpers ─────────── */

function formatPrice(price: number): string {
  if (!price || price <= 0) return "$0.00";
  return `$${price.toFixed(2)}`;
}

function formatDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function renderStars(rating: number, size = 14) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
    } else if (i === full && hasHalf) {
      stars.push(<StarHalf key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
}

function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─────────── Main Component ─────────── */

export default function AdminPanel() {
  const { toast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    recentOrders: Order[];
    lowStockProducts: Product[];
    ordersByStatus: Record<string, number>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenueChart, setRevenueChart] = useState<{ name: string; revenue: number; orders: number }[]>([]);
  const [catalogMeta, setCatalogMeta] = useState<{ promosActive: number; outOfStock: number; catalogValue: number }>({ promosActive: 0, outOfStock: 0, catalogValue: 0 });

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsPage, setProductsPage] = useState(1);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductDialog, setDeleteProductDialog] = useState<Product | null>(null);
  // Product form
  const [pfTitle, setPfTitle] = useState("");
  const [pfPrice, setPfPrice] = useState("");
  const [pfOriginalPrice, setPfOriginalPrice] = useState("");
  const [pfImage, setPfImage] = useState("");
  const [pfImages, setPfImages] = useState<string[]>([]);
  const [pfDescription, setPfDescription] = useState("");
  const [pfCategory, setPfCategory] = useState("");
  const [pfCategories, setPfCategories] = useState<string[]>([]);
  const [pfRating, setPfRating] = useState(4.5);
  const [pfInStock, setPfInStock] = useState(true);
  const [pfFeatured, setPfFeatured] = useState(false);
  const [pfSource, setPfSource] = useState("");
  const [pfSku, setPfSku] = useState("");
  const [pfSaving, setPfSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersTotal, setCustomersTotal] = useState(0);
  const [customersPage, setCustomersPage] = useState(1);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [customerDetailOpen, setCustomerDetailOpen] = useState(false);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewApprovedFilter, setReviewApprovedFilter] = useState("all");
  const [editReviewDialog, setEditReviewDialog] = useState<Review | null>(null);
  const [deleteReviewDialog, setDeleteReviewDialog] = useState<Review | null>(null);
  const [reviewFormAuthor, setReviewFormAuthor] = useState("");
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormComment, setReviewFormComment] = useState("");
  const [reviewFormApproved, setReviewFormApproved] = useState(true);

  // Content
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deleteSlideDialog, setDeleteSlideDialog] = useState<HeroSlide | null>(null);
  const [slideFormImage, setSlideFormImage] = useState("");
  const [slideFormTitle, setSlideFormTitle] = useState("");
  const [slideFormSubtitle, setSlideFormSubtitle] = useState("");
  const [slideFormAccent, setSlideFormAccent] = useState("");
  const [slideFormOrder, setSlideFormOrder] = useState(0);
  const [slideFormActive, setSlideFormActive] = useState(true);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteAnnouncementDialog, setDeleteAnnouncementDialog] = useState<Announcement | null>(null);
  const [annFormMessage, setAnnFormMessage] = useState("");
  const [annFormActive, setAnnFormActive] = useState(true);
  const [annFormOrder, setAnnFormOrder] = useState(0);

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Store sync (publish to GitHub) — the static deployment's data pipeline
  const [unpublishedCount, setUnpublishedCount] = useState(0);
  const [publishStatus, setPublishStatus] = useState<StorePublishStatus>({ state: "idle", message: "", at: null });
  const [publishing, setPublishing] = useState(false);
  const [ghToken, setGhToken] = useState("");
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("");
  const [ghTesting, setGhTesting] = useState(false);
  const [ghTestResult, setGhTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Bulk product actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<null | "delete" | "promo" | "price" | "stock" | "featured" | "category">(null);
  const [bulkPercent, setBulkPercent] = useState("12");
  const [bulkStockIn, setBulkStockIn] = useState(true);
  const [bulkFeatured, setBulkFeatured] = useState(true);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkSubcategory, setBulkSubcategory] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  // Catalog import
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  /* ─────────── Auth ─────────── */

  useEffect(() => {
    const stored = localStorage.getItem("admin_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.role === "admin") {
          setIsAuthenticated(true);
          setAdminUser(parsed);
        }
      } catch {}
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Admin credentials
    const ADMIN_EMAIL = "akihabaratcgwarehouse1@gmail.com";
    const ADMIN_PASSWORD = "Akihabarat1$";

    try {
      // Verify admin credentials — email is case-insensitive (Gmail ignores case);
      // trim() guards against accidental whitespace from mobile keyboards
      const normalizedEmail = loginEmail.trim().toLowerCase();
      const normalizedPassword = loginPassword.trim();
      if (normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD) {
        const adminData: AdminUser = { id: "admin-local", email: ADMIN_EMAIL, name: "Admin", role: "admin" };
        setIsAuthenticated(true);
        setAdminUser(adminData);
        localStorage.setItem("admin_auth", JSON.stringify(adminData));
        toast({ title: "Welcome back!", description: "Logged in as Admin" });
      } else {
        setLoginError("Invalid email or password");
      }
    } catch {
      setLoginError("Network error — please check your connection");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem("admin_auth");
    setActivePage("dashboard");
    toast({ title: "Logged out", description: "You have been logged out" });
  };

  /* ─────────── Store Database (self-contained, no server needed) ─────────── */

  // Initialize the store database once authentication succeeds, and keep the
  // publish state / unpublished-change counter in sync with the store.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const syncFromStore = () => {
      setUnpublishedCount(adminStore.getUnpublishedCount());
      setPublishStatus(adminStore.publish);
    };
    const unsubscribe = adminStore.subscribe(syncFromStore);
    adminStore.ready().then(() => {
      if (cancelled) return;
      const gh = adminStore.getGitHubConfig();
      setGhOwner(gh.owner);
      setGhRepo(gh.repo);
      setGhBranch(gh.branch);
      setGhToken(gh.token);
      syncFromStore();
      // Load the current page's data once the store is ready
      switch (activePage) {
        case "dashboard": fetchStats(); break;
        case "products": fetchProducts(); break;
        case "orders": fetchOrders(); break;
        case "customers": fetchCustomers(); break;
        case "reviews": fetchReviews(); break;
        case "content": fetchContent(); break;
        case "settings": fetchSettings(); break;
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isAuthenticated]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      await adminStore.ready();
      const s = adminStore.getStats();
      setRevenueChart(s.revenueLast7Days);
      setCatalogMeta({ promosActive: s.promosActive, outOfStock: s.outOfStock, catalogValue: s.catalogValue });
      setStats({
        totalProducts: s.totalProducts,
        totalOrders: s.totalOrders,
        totalRevenue: s.totalRevenue,
        totalCustomers: s.totalCustomers,
        recentOrders: adminStore.getOrders().slice(0, 5).map((o) => mapOrderFromApi(o as unknown as Record<string, unknown>)),
        lowStockProducts: adminStore
          .getEffectiveProducts()
          .filter((p) => p.in_stock === false)
          .slice(0, 8)
          .map((p) => mapProductFromApi(p as unknown as Record<string, unknown>)),
        ordersByStatus: s.ordersByStatus,
      });
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      await adminStore.ready();
      const pageSize = 20;
      const all: Product[] = adminStore
        .getEffectiveProducts()
        .map((p) => mapProductFromApi(p as unknown as Record<string, unknown>));

      // Client-side filtering (search + category/subcategory) and pagination
      const q = productSearch.trim().toLowerCase();
      let filtered = all;
      if (q) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            (p.sku || "").toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }
      if (productCategory) {
        const [cat, sub] = productCategory.split("||");
        filtered = filtered.filter((p) => {
          const catOk = p.category === cat;
          if (!catOk) return false;
          if (!sub) return true;
          const subs = p.categories.length > 1 ? p.categories.slice(1) : [];
          return subs.includes(sub);
        });
      }

      const start = (productsPage - 1) * pageSize;
      setProducts(filtered.slice(start, start + pageSize));
      setProductsTotal(filtered.length);
    } catch (err) {
      console.error("Products error:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [productsPage, productSearch, productCategory]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      await adminStore.ready();
      const all = adminStore.getOrders().map((o) => mapOrderFromApi(o as unknown as Record<string, unknown>));

      const q = orderSearch.trim().toLowerCase();
      let filtered = all;
      if (orderStatusFilter !== "all") {
        filtered = filtered.filter((o) => o.status === orderStatusFilter);
      }
      if (q) {
        filtered = filtered.filter(
          (o) =>
            (o.customerName || "").toLowerCase().includes(q) ||
            (o.customerEmail || "").toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q)
        );
      }

      const pageSize = 20;
      const start = (ordersPage - 1) * pageSize;
      setOrders(filtered.slice(start, start + pageSize));
      setOrdersTotal(filtered.length);
    } catch (err) {
      console.error("Orders error:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersPage, orderStatusFilter, orderSearch]);

  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      await adminStore.ready();
      // Customers are derived from the order database
      const map = new Map<string, Customer & { spent: number; count: number }>();
      adminStore.getOrders().forEach((o) => {
        const key = (o.customerEmail || o.customerName || "unknown").toLowerCase();
        if (!key || key === "unknown") return;
        const entry = map.get(key) || {
          id: key,
          email: o.customerEmail || key,
          name: o.customerName,
          phone: o.customerPhone,
          address: o.shippingAddress,
          city: o.shippingCity,
          country: o.shippingCountry,
          createdAt: o.createdAt,
          orderCount: 0,
          totalSpent: 0,
          spent: 0,
          count: 0,
        };
        if (o.status !== "cancelled") entry.spent += o.total;
        entry.count += 1;
        entry.orderCount = entry.count;
        entry.totalSpent = Math.round(entry.spent * 100) / 100;
        map.set(key, entry);
      });

      let list = Array.from(map.values());
      const q = customerSearch.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.city || "").toLowerCase().includes(q) ||
            (c.country || "").toLowerCase().includes(q)
        );
      }

      const pageSize = 20;
      const start = (customersPage - 1) * pageSize;
      setCustomers(list.slice(start, start + pageSize));
      setCustomersTotal(list.length);
    } catch (err) {
      console.error("Customers error:", err);
    } finally {
      setCustomersLoading(false);
    }
  }, [customersPage, customerSearch]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      await adminStore.ready();
      const all = adminStore.getReviews().map((r) => mapReviewFromLocal(r));

      let filtered = all;
      if (reviewApprovedFilter === "approved") filtered = filtered.filter((r) => r.approved);
      if (reviewApprovedFilter === "pending") filtered = filtered.filter((r) => !r.approved);

      const pageSize = 20;
      const start = (reviewsPage - 1) * pageSize;
      setReviews(filtered.slice(start, start + pageSize));
      setReviewsTotal(filtered.length);
    } catch (err) {
      console.error("Reviews error:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewsPage, reviewApprovedFilter]);

  const fetchContent = useCallback(async () => {
    setContentLoading(true);
    try {
      await adminStore.ready();
      const content = adminStore.getContent();
      setHeroSlides(
        [...content.heroSlides]
          .sort((a, b) => a.order - b.order)
          .map((s) => mapHeroSlideFromApi(s as unknown as Record<string, unknown>))
      );
      setAnnouncements(
        [...content.announcements]
          .sort((a, b) => a.order - b.order)
          .map((a) => mapAnnouncementFromApi(a as unknown as Record<string, unknown>))
      );
    } catch (err) {
      console.error("Content error:", err);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      await adminStore.ready();
      const s = adminStore.getContent().settings;
      setSettings({
        siteName: s.siteName || "",
        whatsapp: s.whatsappNumber || "",
        currency: s.currency || "USD",
        jpyRate: s.currencyJPY || "149.5",
        eurRate: s.currencyEUR || "0.92",
        gbpRate: s.currencyGBP || "0.79",
      });
    } catch (err) {
      console.error("Settings error:", err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Fetch data on page change
  useEffect(() => {
    if (!isAuthenticated) return;
    switch (activePage) {
      case "dashboard":
        fetchStats();
        break;
      case "products":
        fetchProducts();
        break;
      case "orders":
        fetchOrders();
        break;
      case "customers":
        fetchCustomers();
        break;
      case "reviews":
        fetchReviews();
        break;
      case "content":
        fetchContent();
        break;
      case "settings":
        fetchSettings();
        break;
    }
  }, [activePage, isAuthenticated, fetchStats, fetchProducts, fetchOrders, fetchCustomers, fetchReviews, fetchContent, fetchSettings]);

  // Re-fetch products when page changes (more reliable pagination)
  useEffect(() => {
    if (isAuthenticated && activePage === "products") {
      fetchProducts();
    }
  }, [productsPage]);

  /* ─────────── Product Helpers ─────────── */

  const resetProductForm = () => {
    setPfTitle("");
    setPfPrice("");
    setPfOriginalPrice("");
    setPfImage("");
    setPfImages([]);
    setPfDescription("");
    setPfCategory("");
    setPfCategories([]);
    setPfRating(4.5);
    setPfInStock(true);
    setPfFeatured(false);
    setPfSource("");
    setPfSku("");
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setPfTitle(product.title);
    setPfPrice(String(product.price));
    setPfOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
    setPfImage(product.image);
    setPfImages(product.images || []);
    setPfDescription(product.description || "");
    setPfCategory(product.category);
    setPfCategories(product.categories || []);
    setPfRating(product.rating);
    setPfInStock(product.inStock);
    setPfFeatured(product.featured);
    setPfSource(product.source || "");
    setPfSku(product.sku || "");
    setProductDialogOpen(true);
  };

  const openAddProduct = () => {
    resetProductForm();
    setProductDialogOpen(true);
  };

  const addImageUrl = () => {
    const url = pfImage.trim();
    if (!url) return;
    if (!pfImages.includes(url)) {
      setPfImages([...pfImages, url]);
    }
  };

  const saveProduct = async () => {
    if (!pfTitle || !pfPrice || !pfCategory) {
      toast({ title: "Missing fields", description: "Title, price, and category are required", variant: "destructive" });
      return;
    }
    if (!pfImage && pfImages.length === 0) {
      toast({ title: "Missing image", description: "Please provide at least one image URL", variant: "destructive" });
      return;
    }
    const price = parseFloat(pfPrice);
    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: "Invalid price", description: "Price must be greater than 0", variant: "destructive" });
      return;
    }
    setPfSaving(true);
    try {
      adminStore.upsertProduct({
        id: editingProduct?.id,
        title: pfTitle,
        price,
        originalPrice: pfOriginalPrice ? parseFloat(pfOriginalPrice) : null,
        image: pfImage || pfImages[0] || "",
        images: pfImages,
        description: pfDescription || null,
        category: pfCategory,
        categories: pfCategories.length > 0 ? pfCategories : [pfCategory],
        rating: pfRating,
        inStock: pfInStock,
        featured: pfFeatured,
        source: pfSource || null,
        sku: pfSku || null,
      });

      toast({
        title: editingProduct ? "Product updated" : "Product created",
        description: `${pfTitle} has been ${editingProduct ? "updated" : "created"} — remember to publish your changes`,
      });
      setProductDialogOpen(false);
      resetProductForm();
      fetchProducts();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setPfSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    try {
      adminStore.deleteProduct(product.id);
      toast({ title: "Product deleted", description: `${product.title} has been removed — remember to publish your changes` });
      setSelectedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      fetchProducts();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete product";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setDeleteProductDialog(null);
  };

  const duplicateProduct = (product: Product) => {
    const copy = adminStore.duplicateProduct(product.id);
    if (copy) {
      toast({ title: "Product duplicated", description: `${product.title} (Copy) created` });
      fetchProducts();
    }
  };

  /* ─────────── Bulk Product Actions ─────────── */

  const selectedIds = Array.from(selectedProductIds);

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    const pageIds = products.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedProductIds.has(id));
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const applyBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkDialog) return;
    setBulkBusy(true);
    try {
      switch (bulkDialog) {
        case "delete":
          adminStore.bulkDelete(selectedIds);
          toast({ title: "Products deleted", description: `${selectedIds.length} products removed` });
          break;
        case "promo": {
          const pct = parseFloat(bulkPercent);
          if (!Number.isFinite(pct) || pct <= 0 || pct > 90) {
            toast({ title: "Invalid percent", description: "Enter a discount between 1 and 90", variant: "destructive" });
            setBulkBusy(false);
            return;
          }
          adminStore.applyPromo(selectedIds, pct);
          toast({ title: "Promo applied", description: `${selectedIds.length} products now ${pct}% off with struck-through original price` });
          break;
        }
        case "price": {
          const pct = parseFloat(bulkPercent);
          if (!Number.isFinite(pct) || pct < -90 || pct > 500) {
            toast({ title: "Invalid percent", description: "Enter a price change between -90% and +500%", variant: "destructive" });
            setBulkBusy(false);
            return;
          }
          adminStore.adjustPrice(selectedIds, pct);
          toast({ title: "Prices adjusted", description: `${selectedIds.length} products changed by ${pct > 0 ? "+" : ""}${pct}%` });
          break;
        }
        case "stock":
          adminStore.bulkPatch(selectedIds, () => ({ in_stock: bulkStockIn }));
          toast({ title: "Stock updated", description: `${selectedIds.length} products marked ${bulkStockIn ? "in stock" : "out of stock"}` });
          break;
        case "featured":
          adminStore.bulkPatch(selectedIds, () => ({ featured: bulkFeatured }));
          toast({ title: "Featured updated", description: `${selectedIds.length} products ${bulkFeatured ? "marked featured (shown first)" : "unfeatured"}` });
          break;
        case "category": {
          if (!bulkCategory) {
            toast({ title: "Missing category", description: "Choose a destination category", variant: "destructive" });
            setBulkBusy(false);
            return;
          }
          adminStore.bulkPatch(selectedIds, (p) => ({
            category: bulkCategory,
            categories: [bulkCategory, ...(bulkSubcategory ? [bulkSubcategory] : [])],
          }));
          toast({ title: "Products moved", description: `${selectedIds.length} products moved to ${bulkCategory}${bulkSubcategory ? ` ▸ ${bulkSubcategory}` : ""}` });
          break;
        }
      }
      setSelectedProductIds(new Set());
      setBulkDialog(null);
      fetchProducts();
      fetchStats();
    } finally {
      setBulkBusy(false);
    }
  };

  /* ─────────── Order Helpers ─────────── */

  const openOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    setOrderDetailOpen(true);
    try {
      await adminStore.ready();
      const raw = adminStore.getOrders().find((o) => o.id === orderId);
      if (!raw) throw new Error("Order not found");
      const order = mapOrderFromApi(raw as unknown as Record<string, unknown>);
      setSelectedOrder(order);
      setOrderNotes(order.notes || "");
    } catch {
      toast({ title: "Error", description: "Failed to load order details", variant: "destructive" });
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      adminStore.updateOrder(orderId, { status });
      toast({ title: "Order updated", description: `Status changed to ${status}` });
      fetchOrders();
      fetchStats();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const updateOrderNotes = async (orderId: string) => {
    try {
      adminStore.updateOrder(orderId, { notes: orderNotes });
      toast({ title: "Notes saved", description: "Order notes updated" });
      fetchOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update notes";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const deleteOrder = (orderId: string) => {
    adminStore.deleteOrder(orderId);
    toast({ title: "Order deleted", description: `Order ${orderId} removed` });
    setOrderDetailOpen(false);
    fetchOrders();
    fetchStats();
  };

  /* ─────────── Customer Helpers ─────────── */

  const openCustomerDetail = async (customerId: string) => {
    setCustomerDetailLoading(true);
    setCustomerDetailOpen(true);
    try {
      await adminStore.ready();
      const orders = adminStore
        .getOrders()
        .filter((o) => (o.customerEmail || o.customerName || "").toLowerCase() === customerId)
        .map((o) => mapOrderFromApi(o as unknown as Record<string, unknown>));
      const first = orders[0];
      if (first) {
        const totalSpent = Math.round(
          orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) * 100
        ) / 100;
        setSelectedCustomer({
          id: customerId,
          email: first.customerEmail || customerId,
          name: first.customerName,
          phone: first.customerPhone,
          address: first.shippingAddress,
          city: first.shippingCity,
          country: first.shippingCountry,
          createdAt: first.createdAt,
          orderCount: orders.length,
          totalSpent,
          orders,
        });
      } else {
        toast({ title: "Not found", description: "No orders for this customer", variant: "destructive" });
      }
    } finally {
      setCustomerDetailLoading(false);
    }
  };

  /* ─────────── Review Helpers ─────────── */

  const toggleReviewApproval = async (review: Review) => {
    adminStore.upsertReview({
      id: review.id,
      productId: review.productId,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      approved: !review.approved,
    });
    toast({ title: review.approved ? "Review hidden" : "Review approved", description: `${review.author}'s review is now ${review.approved ? "hidden" : "approved"}` });
    fetchReviews();
  };

  const openEditReview = (review: Review) => {
    setEditReviewDialog(review);
    setReviewFormAuthor(review.author);
    setReviewFormRating(review.rating);
    setReviewFormComment(review.comment);
    setReviewFormApproved(review.approved);
  };

  const saveReview = async () => {
    if (!editReviewDialog) return;
    adminStore.upsertReview({
      id: editReviewDialog.id,
      productId: editReviewDialog.productId,
      author: reviewFormAuthor,
      rating: reviewFormRating,
      comment: reviewFormComment,
      date: editReviewDialog.date,
      approved: reviewFormApproved,
    });
    toast({ title: "Review saved", description: `${reviewFormAuthor}'s review has been updated` });
    setEditReviewDialog(null);
    fetchReviews();
  };

  const deleteReview = async (review: Review) => {
    adminStore.deleteReview(review.id);
    toast({ title: "Review deleted", description: `${review.author}'s review has been removed` });
    setDeleteReviewDialog(null);
    fetchReviews();
  };

  /* ─────────── Content Helpers ─────────── */

  const resetSlideForm = () => {
    setSlideFormImage("");
    setSlideFormTitle("");
    setSlideFormSubtitle("");
    setSlideFormAccent("");
    setSlideFormOrder(0);
    setSlideFormActive(true);
    setEditingSlide(null);
  };

  const openEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideFormImage(slide.image);
    setSlideFormTitle(slide.title);
    setSlideFormSubtitle(slide.subtitle);
    setSlideFormAccent(slide.accent);
    setSlideFormOrder(slide.order);
    setSlideFormActive(slide.active);
    setSlideDialogOpen(true);
  };

  const saveSlide = async () => {
    if (!slideFormImage || !slideFormTitle || !slideFormSubtitle) {
      toast({ title: "Missing fields", description: "Image, title, and subtitle are required", variant: "destructive" });
      return;
    }
    try {
      await adminStore.ready();
      const content = adminStore.getContent();
      const slide = {
        id: editingSlide?.id || `slide-${Date.now().toString(36)}`,
        image: slideFormImage,
        title: slideFormTitle,
        subtitle: slideFormSubtitle,
        accent: slideFormAccent,
        order: slideFormOrder,
        active: slideFormActive,
      };
      const slides = editingSlide
        ? content.heroSlides.map((s) => (s.id === editingSlide.id ? slide : s))
        : [...content.heroSlides, slide];
      adminStore.setContent({ ...content, heroSlides: slides });

      toast({ title: editingSlide ? "Slide updated" : "Slide created", description: "Publish to make it live on the store" });
      setSlideDialogOpen(false);
      resetSlideForm();
      fetchContent();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save slide";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const deleteSlide = async (slide: HeroSlide) => {
    await adminStore.ready();
    const content = adminStore.getContent();
    adminStore.setContent({
      ...content,
      heroSlides: content.heroSlides.filter((s) => s.id !== slide.id),
    });
    toast({ title: "Slide deleted", description: "Publish to remove it from the store" });
    setDeleteSlideDialog(null);
    fetchContent();
  };

  const resetAnnouncementForm = () => {
    setAnnFormMessage("");
    setAnnFormActive(true);
    setAnnFormOrder(0);
    setEditingAnnouncement(null);
  };

  const openEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setAnnFormMessage(ann.message);
    setAnnFormActive(ann.active);
    setAnnFormOrder(ann.order);
    setAnnouncementDialogOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!annFormMessage) {
      toast({ title: "Missing field", description: "Message is required", variant: "destructive" });
      return;
    }
    try {
      await adminStore.ready();
      const content = adminStore.getContent();
      const ann = {
        id: editingAnnouncement?.id || `ann-${Date.now().toString(36)}`,
        message: annFormMessage,
        active: annFormActive,
        order: annFormOrder,
      };
      const items = editingAnnouncement
        ? content.announcements.map((a) => (a.id === editingAnnouncement.id ? ann : a))
        : [...content.announcements, ann];
      adminStore.setContent({ ...content, announcements: items });

      toast({ title: editingAnnouncement ? "Announcement updated" : "Announcement created", description: "Publish to show it in the store's announcement bar" });
      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      fetchContent();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save announcement";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const deleteAnnouncement = async (ann: Announcement) => {
    await adminStore.ready();
    const content = adminStore.getContent();
    adminStore.setContent({
      ...content,
      announcements: content.announcements.filter((a) => a.id !== ann.id),
    });
    toast({ title: "Announcement deleted", description: "Publish to remove it from the store" });
    setDeleteAnnouncementDialog(null);
    fetchContent();
  };

  /* ─────────── Settings Helpers ─────────── */

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      await adminStore.ready();
      const content = adminStore.getContent();
      adminStore.setContent({
        ...content,
        settings: {
          siteName: settings.siteName || "Akihabara TCG Warehouse",
          whatsappNumber: settings.whatsapp || "",
          currency: settings.currency || "USD",
          currencyJPY: settings.jpyRate || "149.5",
          currencyEUR: settings.eurRate || "0.92",
          currencyGBP: settings.gbpRate || "0.79",
        },
      });

      toast({ title: "Settings saved", description: "Publish to apply them to the live store" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSettingsSaving(false);
    }
  };

  /* ─────────── Store Sync (Publish) ─────────── */

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await adminStore.publishChanges();
      if (!result.ok) {
        toast({ title: "Publish failed", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Changes published", description: "The live store is rebuilding — usually live within a few minutes" });
        fetchStats();
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardChanges = () => {
    adminStore.discardLocalChanges();
    toast({ title: "Local changes discarded", description: "Back to the live store data" });
    fetchProducts();
    fetchStats();
    fetchContent();
    fetchSettings();
  };

  const saveGitHubConnection = () => {
    adminStore.saveGitHubConfig({
      token: ghToken,
      owner: ghOwner.trim() || "Zionimagodei2",
      repo: ghRepo.trim() || "AKIHABARATCGWAREHOUSE",
      branch: ghBranch.trim() || "main",
    });
    toast({ title: "Connection saved", description: "The token is stored only in this browser" });
  };

  const testGitHubConnection = async () => {
    setGhTesting(true);
    setGhTestResult(null);
    try {
      // Save first so the store tests the current inputs
      adminStore.saveGitHubConfig({
        token: ghToken,
        owner: ghOwner.trim() || "Zionimagodei2",
        repo: ghRepo.trim() || "AKIHABARATCGWAREHOUSE",
        branch: ghBranch.trim() || "main",
      });
      const result = await adminStore.testGitHub();
      setGhTestResult(result);
    } finally {
      setGhTesting(false);
    }
  };

  /* ─────────── Catalog Import / Export ─────────── */

  const exportCatalog = () => {
    const json = adminStore.exportCatalog();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `akihabara-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Catalog exported", description: `${adminStore.getEffectiveProducts().length} products downloaded` });
  };

  const importCatalog = async () => {
    setImportBusy(true);
    try {
      const result = adminStore.importCatalog(importText);
      if (!result.ok) {
        toast({ title: "Import failed", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Catalog imported", description: `${result.count} products loaded — review and publish` });
      setImportOpen(false);
      setImportText("");
      fetchProducts();
      fetchStats();
    } finally {
      setImportBusy(false);
    }
  };

  const handleClearSampleData = () => {
    adminStore.clearSampleData();
    toast({ title: "Sample data cleared", description: "Orders and reviews from the demo have been removed" });
    fetchOrders();
    fetchCustomers();
    fetchReviews();
    fetchStats();
  };

  const handleRefreshFromLive = async () => {
    await adminStore.refreshBaseline();
    toast({ title: "Re-synced", description: "Latest live store data loaded" });
    fetchProducts();
    fetchStats();
    fetchContent();
    fetchSettings();
  };

  /* ─────────── Render: Login Screen ─────────── */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex items-center justify-center gap-3">
                <Image src="/store-logo.webp" alt="Akihabara TCG" width={48} height={48} className="rounded-lg object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-purple-950">Akihabara TCG</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <CardTitle className="text-lg">Sign in to your account</CardTitle>
              <CardDescription>Enter your admin credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
                    <XCircle size={16} />
                    {loginError}
                  </div>
                )}
                <Button type="submit" className="w-full bg-purple-950 hover:bg-purple-800" disabled={loginLoading}>
                  {loginLoading ? (
                    <RefreshCw className="animate-spin mr-2" size={16} />
                  ) : null}
                  Sign In
                </Button>
                <p className="text-center text-[11px] text-gray-400">
                  Products, orders and content load automatically from the store
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ─────────── Render: Sidebar ─────────── */

  const renderSidebar = () => (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-purple-950 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Image src="/store-logo.webp" alt="Logo" width={40} height={40} className="rounded-lg object-cover" />
          <div>
            <h2 className="text-white font-bold text-sm">Akihabara TCG</h2>
            <p className="text-white/50 text-[11px]">Warehouse Admin</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActivePage(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {item.key === "orders" && stats && stats.ordersByStatus?.pending > 0 && (
                    <Badge className="ml-auto bg-yellow-500 text-black text-[10px] h-5 px-1.5">
                      {stats.ordersByStatus.pending}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {getInitials(adminUser?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminUser?.name}</p>
              <p className="text-white/50 text-[11px] truncate">{adminUser?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/60 hover:text-violet-300 hover:bg-white/5"
            onClick={() => window.location.href = "/"}
          >
            <Globe size={16} className="mr-2" />
            Back to Store
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/60 hover:text-red-400 hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );

  /* ─────────── Render: Page Header ─────────── */

  const renderPageHeader = (title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span>Admin</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{title}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );

  /* ─────────── Render: Loading Skeletons ─────────── */

  const renderSkeleton = (rows = 5) => (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );

  /* ─────────── Render: Dashboard ─────────── */

  const renderDashboard = () => {
    const rev = stats?.totalRevenue || 0;
    const ord = stats?.totalOrders || 0;
    const prod = stats?.totalProducts || 0;
    const cust = stats?.totalCustomers || 0;
    const statCards = [
      {
        title: "Total Revenue",
        value: formatPrice(rev),
        change: rev > 0 ? `${((rev / Math.max(rev, 1)) * 100).toFixed(1)}%` : "No data",
        up: rev > 0,
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Total Orders",
        value: String(ord),
        change: ord > 0 ? `Active` : "No orders yet",
        up: ord > 0,
        icon: ShoppingCart,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Total Products",
        value: String(prod),
        change: prod > 0 ? `${prod} in the catalog` : "No products",
        up: prod > 0,
        icon: Package,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        title: "Total Customers",
        value: String(cust),
        change: cust > 0 ? `${cust} registered` : "No customers yet",
        up: cust > 0,
        icon: Users,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
    ];

    return (
      <div className="space-y-6">
        {renderPageHeader("Dashboard", "Overview of your store performance")}

        {/* Unpublished changes banner */}
        {unpublishedCount > 0 && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <CloudUpload size={18} className="text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {unpublishedCount} unpublished change{unpublishedCount === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Edits are saved in this browser. Publish to push them to the live store (takes a few minutes to rebuild).
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePublish} disabled={publishing} className="bg-purple-950 hover:bg-purple-800">
                  <CloudUpload size={14} className="mr-1.5" /> Publish now
                </Button>
                <Button size="sm" variant="outline" onClick={handleDiscardChanges} className="border-amber-300 text-amber-800 hover:bg-amber-100">
                  Discard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${card.up ? "text-emerald-600" : "text-gray-400"}`}>
                          {card.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {card.change}
                        </div>
                      </div>
                      <div className={`${card.bg} p-2.5 rounded-lg`}>
                        <Icon size={20} className={card.color} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Catalog Health */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-lg">
                <Tag size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Promos</p>
                <p className="text-lg font-bold text-gray-900">{catalogMeta.promosActive}</p>
                <p className="text-[11px] text-gray-400">products with a struck-through price</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-red-50 p-2.5 rounded-lg">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
                <p className="text-lg font-bold text-gray-900">{catalogMeta.outOfStock}</p>
                <p className="text-[11px] text-gray-400">need restocking</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <DollarSign size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Catalog Value</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(catalogMeta.catalogValue)}</p>
                <p className="text-[11px] text-gray-400">sum of all listing prices</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts + Recent Orders */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="xl:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#581c87" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#581c87" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                      formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#581c87" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Order Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {ORDER_STATUSES.map((status) => {
                  const count = stats?.ordersByStatus?.[status] || 0;
                  const total = stats?.totalOrders || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm capitalize font-medium">{status}</span>
                        <span className="text-sm text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                  <CardDescription>Latest 5 orders</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivePage("orders")}>
                  View All <ChevronRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                renderSkeleton(5)
              ) : (
                <div className="space-y-3">
                  {(stats?.recentOrders || []).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => openOrderDetail(order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {order.customerName || order.customerEmail || `Order #${order.id.slice(-6)}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <div className="text-center py-8 text-gray-400 text-sm">No orders yet</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock / Out of Stock */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Low Stock Alerts</CardTitle>
                  <CardDescription>Products that are out of stock</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivePage("products")}>
                  View All <ChevronRight size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                renderSkeleton(5)
              ) : (
                <div className="space-y-3">
                  {(stats?.lowStockProducts || []).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="size-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                        {product.image && (
                          <Image src={product.image} alt={product.title} width={40} height={40} className="size-full object-cover" unoptimized />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
                        Out of Stock
                      </Badge>
                    </div>
                  ))}
                  {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
                    <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      All products are in stock!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  /* ─────────── Render: Products ─────────── */

  /* Build category ▸ subcategory filter options from the live catalog */
  const buildCategoryOptions = () => {
    const map = new Map<string, Set<string>>();
    adminStore.getEffectiveProducts().forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, new Set());
      const subs = p.categories && p.categories.length > 1 ? p.categories.slice(1) : [];
      subs.forEach((s) => map.get(p.category)!.add(s));
    });
    return Array.from(map.entries()).sort().flatMap(([cat, subs]) => [
      { value: cat, label: cat, isSub: false },
      ...Array.from(subs).sort().map((s) => ({ value: `${cat}||${s}`, label: `▸ ${s}`, isSub: true })),
    ]);
  };

  const renderProducts = () => {
    const categoryOptions = buildCategoryOptions();

    return (
    <div className="space-y-6">
      {renderPageHeader("Products", "Manage your product catalog", (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={14} className="mr-1.5" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportCatalog}>
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button onClick={openAddProduct} className="bg-purple-950 hover:bg-purple-800">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>
      ))}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products by title, description, or SKU..."
            className="pl-9"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setProductsPage(1);
            }}
          />
        </div>
        <Select value={productCategory || "all"} onValueChange={(v) => { setProductCategory(v === "all" ? "" : v); setProductsPage(1); }}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className={opt.isSub ? "pl-6 text-gray-600" : "font-medium"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action toolbar */}
      {selectedProductIds.size > 0 && (
        <Card className="border-purple-200 bg-purple-50 shadow-sm">
          <CardContent className="p-3 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
              <Zap size={14} className="text-purple-600" />
              {selectedProductIds.size} selected
              <button
                className="text-xs text-purple-600 underline underline-offset-2 hover:text-purple-800"
                onClick={() => setSelectedProductIds(new Set())}
              >
                clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="bg-white" onClick={() => setBulkDialog("promo")}>
                <Tag size={14} className="mr-1.5" /> Set Promo %
              </Button>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => setBulkDialog("price")}>
                <DollarSign size={14} className="mr-1.5" /> Adjust Prices
              </Button>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => setBulkDialog("stock")}>
                <Package size={14} className="mr-1.5" /> Stock
              </Button>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => setBulkDialog("featured")}>
                <Star size={14} className="mr-1.5" /> Featured
              </Button>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => setBulkDialog("category")}>
                <ChevronRight size={14} className="mr-1.5" /> Move Category
              </Button>
              <Button size="sm" variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50" onClick={() => setBulkDialog("delete")}>
                <Trash2 size={14} className="mr-1.5" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="p-6">{renderSkeleton(8)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or add a new product</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={products.length > 0 && products.every((p) => selectedProductIds.has(p.id))}
                          onCheckedChange={toggleSelectPage}
                          aria-label="Select all products on this page"
                        />
                      </TableHead>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden sm:table-cell">Stock</TableHead>
                      <TableHead className="hidden lg:table-cell">Featured</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const discount = product.originalPrice ? formatDiscount(product.price, product.originalPrice) : 0;
                      return (
                        <TableRow key={product.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedProductIds.has(product.id)}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                              aria-label={`Select ${product.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="size-12 rounded-md overflow-hidden bg-gray-100">
                              {product.image && (
                                <Image src={product.image} alt={product.title} width={48} height={48} className="size-full object-cover" unoptimized />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-medium text-sm truncate">{product.title}</p>
                              {product.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>}
                              {product.updatedAt && (
                                <p className="text-[10px] text-gray-400 mt-0.5">updated {formatDate(product.updatedAt)}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-[11px]">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-sm">{formatPrice(product.price)}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] h-5">-{discount}%</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <button
                              onClick={() => {
                                adminStore.patchProduct(product.id, { in_stock: !product.inStock });
                                fetchProducts();
                                fetchStats();
                              }}
                              title={product.inStock ? "Click to mark out of stock" : "Click to mark in stock"}
                              className="cursor-pointer"
                            >
                              <Badge variant="outline" className={`text-[10px] ${product.inStock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <button
                              onClick={() => {
                                adminStore.patchProduct(product.id, { featured: !product.featured });
                                fetchProducts();
                              }}
                              title={product.featured ? "Click to unfeature" : "Click to feature (shows first on the store)"}
                              className="cursor-pointer"
                            >
                              {product.featured ? (
                                <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Featured</Badge>
                              ) : (
                                <span className="text-xs text-gray-300 hover:text-amber-500 transition-colors">☆</span>
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreVertical size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditProduct(product)}>
                                  <Pencil size={14} className="mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateProduct(product)}>
                                  <Copy size={14} className="mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`/?product=${encodeURIComponent(product.id)}`, "_blank")}>
                                  <Eye size={14} className="mr-2" /> View on store
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedProductIds(new Set([product.id])); setBulkDialog("promo"); }}>
                                  <Tag size={14} className="mr-2" /> Set promo
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteProductDialog(product)}>
                                  <Trash2 size={14} className="mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {products.length} of {productsTotal} products
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productsPage <= 1}
                    onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productsPage >= Math.ceil(productsTotal / 20)}
                    onClick={() => setProductsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetProductForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details below" : "Fill in the product details to create a new listing"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Main Image URL */}
            <div className="space-y-2">
              <Label htmlFor="pf-main-image">Main Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="pf-main-image"
                  placeholder="https://example.com/image.jpg or /images/your-image.webp"
                  value={pfImage}
                  onChange={(e) => setPfImage(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="shrink-0">
                  Add to Gallery
                </Button>
              </div>
              {pfImage && (
                <div className="h-32 w-48 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={pfImage} alt="Main image preview" width={192} height={128} className="w-full h-full object-cover" unoptimized />
                </div>
              )}
            </div>

            {/* Image Gallery URLs */}
            <div className="space-y-2">
              <Label>Image Gallery</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste additional image URL and press Add"
                  id="pf-gallery-url"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        setPfImages([...pfImages, input.value.trim()]);
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const input = document.getElementById("pf-gallery-url") as HTMLInputElement;
                  if (input?.value.trim()) {
                    setPfImages([...pfImages, input.value.trim()]);
                    input.value = "";
                  }
                }} className="shrink-0">
                  Add
                </Button>
              </div>
              {/* Image Previews */}
              {pfImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {pfImages.map((img, idx) => (
                    <div key={idx} className="relative group size-20 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" unoptimized />
                      <button
                        className="absolute top-1 right-1 size-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = pfImages.filter((_, i) => i !== idx);
                          setPfImages(newImages);
                          if (pfImage === img) setPfImage(newImages[0] || "");
                        }}
                      >
                        <X size={10} />
                      </button>
                      {img === pfImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-purple-950 text-white text-[9px] text-center py-0.5 font-medium">Main</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="pf-title">Title *</Label>
              <Input id="pf-title" placeholder="Product title" value={pfTitle} onChange={(e) => setPfTitle(e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="pf-desc">Description</Label>
              <Textarea id="pf-desc" placeholder="Product description..." rows={3} value={pfDescription} onChange={(e) => setPfDescription(e.target.value)} />
            </div>

            {/* Price & Original Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-price">Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <Input id="pf-price" type="number" step="0.01" placeholder="0.00" className="pl-7" value={pfPrice} onChange={(e) => setPfPrice(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-original">Original Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <Input id="pf-original" type="number" step="0.01" placeholder="0.00" className="pl-7" value={pfOriginalPrice} onChange={(e) => setPfOriginalPrice(e.target.value)} />
                </div>
                {pfOriginalPrice && pfPrice && parseFloat(pfOriginalPrice) > parseFloat(pfPrice) && (
                  <p className="text-xs text-emerald-600 font-medium">
                    {formatDiscount(parseFloat(pfPrice), parseFloat(pfOriginalPrice))}% discount will be shown
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Primary Category *</Label>
              <Select value={pfCategory} onValueChange={setPfCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {buildCategoryOptions().filter((o) => !o.isSub).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {buildCategoryOptions()
                  .filter((o) => o.isSub && pfCategory && o.value.startsWith(`${pfCategory}||`))
                  .map((opt) => {
                    const sub = opt.label.replace("▸ ", "");
                    return (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`sub-${opt.value}`}
                          checked={pfCategories.includes(sub)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPfCategories([pfCategory, ...pfCategories.filter((c) => c !== pfCategory), sub]);
                            } else {
                              setPfCategories(pfCategories.filter((c) => c !== sub));
                            }
                          }}
                        />
                        <Label htmlFor={`sub-${opt.value}`} className="text-xs font-normal cursor-pointer">{sub}</Label>
                      </div>
                    );
                  })}
              </div>
              <p className="text-[11px] text-gray-400">The subcategory controls which filter tab the product appears under on the store.</p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating: {pfRating.toFixed(1)}</Label>
              <Slider value={[pfRating]} min={1} max={5} step={0.5} onValueChange={([v]) => setPfRating(v)} />
              <div className="flex items-center gap-1 mt-1">{renderStars(pfRating, 16)}</div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">In Stock</Label>
                  <p className="text-xs text-gray-500">Product is available for purchase</p>
                </div>
                <Switch checked={pfInStock} onCheckedChange={setPfInStock} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-gray-500">Show in featured section</p>
                </div>
                <Switch checked={pfFeatured} onCheckedChange={setPfFeatured} />
              </div>
            </div>

            {/* Source & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-source">Source</Label>
                <Input id="pf-source" placeholder="e.g. Japan, US Distributor" value={pfSource} onChange={(e) => setPfSource(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-sku">SKU</Label>
                <Input id="pf-sku" placeholder="e.g. PKM-SV5M-001" value={pfSku} onChange={(e) => setPfSku(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setProductDialogOpen(false); resetProductForm(); }}>
              Cancel
            </Button>
            <Button onClick={saveProduct} disabled={pfSaving} className="bg-purple-950 hover:bg-purple-800">
              {pfSaving && <RefreshCw className="animate-spin mr-2" size={14} />}
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductDialog} onOpenChange={() => setDeleteProductDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteProductDialog?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteProductDialog && deleteProduct(deleteProductDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bulk Actions Dialogs */}
      <Dialog open={bulkDialog === "promo" || bulkDialog === "price"} onOpenChange={(open) => !open && setBulkDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{bulkDialog === "promo" ? "Set Promo" : "Adjust Prices"}</DialogTitle>
            <DialogDescription>
              {bulkDialog === "promo"
                ? `${selectedProductIds.size} products — the current price becomes the struck-through original, and the new price is discounted by the percent below.`
                : `${selectedProductIds.size} products — change all prices by a percent (use negative to reduce, e.g. -10).`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bulk-percent">
                {bulkDialog === "promo" ? "Discount percent (%)" : "Price change (%)"}
              </Label>
              <Input
                id="bulk-percent"
                type="number"
                step="0.5"
                value={bulkPercent}
                onChange={(e) => setBulkPercent(e.target.value)}
                placeholder="12"
              />
            </div>
            {bulkDialog === "promo" && (
              <div className="flex gap-2">
                {[5, 10, 12, 15, 20, 25, 30].map((p) => (
                  <button
                    key={p}
                    onClick={() => setBulkPercent(String(p))}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-purple-400 hover:text-purple-700 transition-colors"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog(null)}>Cancel</Button>
            <Button onClick={applyBulkAction} disabled={bulkBusy} className="bg-purple-950 hover:bg-purple-800">
              {bulkBusy && <RefreshCw className="animate-spin mr-2" size={14} />}
              {bulkDialog === "promo" ? "Apply promo" : "Adjust prices"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialog === "stock" || bulkDialog === "featured"} onOpenChange={(open) => !open && setBulkDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{bulkDialog === "stock" ? "Update Stock" : "Update Featured"}</DialogTitle>
            <DialogDescription>
              {bulkDialog === "stock"
                ? `${selectedProductIds.size} products — choose the stock state to apply.`
                : `${selectedProductIds.size} products — featured products are shown first on the store.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-toggle-value">
                {bulkDialog === "stock" ? "Mark as in stock" : "Mark as featured"}
              </Label>
              <Switch
                id="bulk-toggle-value"
                checked={bulkDialog === "stock" ? bulkStockIn : bulkFeatured}
                onCheckedChange={(v) => (bulkDialog === "stock" ? setBulkStockIn(v) : setBulkFeatured(v))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog(null)}>Cancel</Button>
            <Button onClick={applyBulkAction} disabled={bulkBusy} className="bg-purple-950 hover:bg-purple-800">
              {bulkBusy && <RefreshCw className="animate-spin mr-2" size={14} />}
              Apply to {selectedProductIds.size} products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialog === "category"} onOpenChange={(open) => !open && setBulkDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Category</DialogTitle>
            <DialogDescription>
              {selectedProductIds.size} products will be moved to the category (and optional subcategory) below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(adminStore.getEffectiveProducts().map((p) => p.category))).sort().map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-subcategory">Subcategory (optional)</Label>
              <Input
                id="bulk-subcategory"
                value={bulkSubcategory}
                onChange={(e) => setBulkSubcategory(e.target.value)}
                placeholder="e.g. Booster Boxes, Sealed Case…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog(null)}>Cancel</Button>
            <Button onClick={applyBulkAction} disabled={bulkBusy} className="bg-purple-950 hover:bg-purple-800">
              {bulkBusy && <RefreshCw className="animate-spin mr-2" size={14} />}
              Move {selectedProductIds.size} products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDialog === "delete"} onOpenChange={(open) => !open && setBulkDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedProductIds.size} products</AlertDialogTitle>
            <AlertDialogDescription>
              These products will be removed from the catalog. Publish afterwards to remove them from the live store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={applyBulkAction}>
              Delete {selectedProductIds.size} products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Catalog Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Catalog</DialogTitle>
            <DialogDescription>
              Paste a previously exported catalog JSON (an array of products). This replaces the local working catalog — review, then publish.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Textarea
              rows={12}
              className="font-mono text-xs"
              placeholder='[ { "id": "1", "title": "…", "price": 49.99, "image": "/images/…", "category": "Pokemon", "categories": ["Pokemon", "Booster Boxes"], "rating": 4.5, "in_stock": true } ]'
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={importCatalog} disabled={importBusy || !importText.trim()} className="bg-purple-950 hover:bg-purple-800">
              {importBusy && <RefreshCw className="animate-spin mr-2" size={14} />}
              Import catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    );
  };

  /* ─────────── Render: Orders ─────────── */

  const renderOrders = () => (
    <div className="space-y-6">
      {renderPageHeader("Orders", "Track and manage customer orders")}

      {/* Status Filter Tabs */}
      <Tabs value={orderStatusFilter} onValueChange={(v) => { setOrderStatusFilter(v); setOrdersPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by order ID, customer name, or email..."
          className="pl-9 max-w-md"
          value={orderSearch}
          onChange={(e) => { setOrderSearch(e.target.value); setOrdersPage(1); }}
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6">{renderSkeleton(8)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-medium">#{order.id.slice(-8)}</span>
                            {order.notes?.includes("Sample order") && (
                              <Badge className="bg-gray-100 text-gray-600 border-0 text-[9px] h-4 px-1.5 w-fit">Sample</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{order.customerName || "—"}</p>
                            <p className="text-xs text-gray-400 truncate">{order.customerEmail || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{order.items?.length || 0} items</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[order.status] || ""}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openOrderDetail(order.id)}>
                              <Eye size={14} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreVertical size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {ORDER_STATUSES.map((s) => (
                                  <DropdownMenuItem key={s} onClick={() => updateOrderStatus(order.id, s)} className="capitalize">
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteOrder(order.id)}>
                                  <Trash2 size={14} className="mr-2" /> Delete order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">Showing {orders.length} of {ordersTotal} orders</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={ordersPage <= 1} onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={orders.length < 20} onClick={() => setOrdersPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id?.slice(-8)}</DialogTitle>
            <DialogDescription>Order details and management</DialogDescription>
          </DialogHeader>
          {orderDetailLoading ? (
            <div className="py-8">{renderSkeleton(4)}</div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Status + Quick Update */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="outline" className={`capitalize ${STATUS_COLORS[selectedOrder.status] || ""}`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Update:</span>
                  <Select value={selectedOrder.status} onValueChange={(v) => updateOrderStatus(selectedOrder.id, v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Customer</h4>
                  <div className="space-y-2">
                    {selectedOrder.customerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-gray-400" />
                        {selectedOrder.customerName}
                      </div>
                    )}
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-gray-400" />
                        {selectedOrder.customerEmail}
                      </div>
                    )}
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        {selectedOrder.customerPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Shipping Address</h4>
                  <div className="space-y-2">
                    {selectedOrder.shippingAddress && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          {selectedOrder.shippingAddress}
                          {(selectedOrder.shippingCity || selectedOrder.shippingCountry) && (
                            <p className="text-gray-500">
                              {[selectedOrder.shippingCity, selectedOrder.shippingZip, selectedOrder.shippingCountry].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {!selectedOrder.shippingAddress && <p className="text-sm text-gray-400">No address provided</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Items ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="size-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.title} width={48} height={48} className="size-full object-cover" unoptimized />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total + Date */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <Calendar size={14} className="inline mr-1" />
                  {formatDateTime(selectedOrder.createdAt)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{formatPrice(selectedOrder.total)}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Order Notes</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add notes about this order..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => updateOrderNotes(selectedOrder.id)}>
                  Save Notes
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );

  /* ─────────── Render: Customers ─────────── */

  const renderCustomers = () => (
    <div className="space-y-6">
      {renderPageHeader("Customers", "View and manage your customer base")}

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, email, city, or country..."
          className="pl-9"
          value={customerSearch}
          onChange={(e) => { setCustomerSearch(e.target.value); setCustomersPage(1); }}
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {customersLoading ? (
            <div className="p-6">{renderSkeleton(8)}</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs bg-purple-950 text-white">{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{customer.name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{customer.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-500">{customer.phone || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className="text-[10px]">{customer.orderCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">{formatPrice(customer.totalSpent)}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-gray-500">{formatDate(customer.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => openCustomerDetail(customer.id)}>
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">Showing {customers.length} of {customersTotal} customers</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={customersPage <= 1} onClick={() => setCustomersPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={customers.length < 20} onClick={() => setCustomersPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={customerDetailOpen} onOpenChange={setCustomerDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View customer information and order history</DialogDescription>
          </DialogHeader>
          {customerDetailLoading ? (
            <div className="py-8">{renderSkeleton(4)}</div>
          ) : selectedCustomer ? (
            <div className="space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg bg-purple-950 text-white">{getInitials(selectedCustomer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedCustomer.name || "Unknown"}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={13} /> {selectedCustomer.email}</span>
                    {selectedCustomer.phone && <span className="flex items-center gap-1"><Phone size={13} /> {selectedCustomer.phone}</span>}
                  </div>
                  {(selectedCustomer.city || selectedCustomer.country) && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={13} /> {[selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-none bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.orderCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Orders</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{formatPrice(selectedCustomer.totalSpent)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Spent</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{formatDate(selectedCustomer.createdAt)}</p>
                    <p className="text-xs text-gray-500 mt-1">Joined</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Order History</h4>
                <div className="space-y-2">
                  {selectedCustomer.orders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium font-mono">#{order.id.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)} · {order.items?.length || 0} items</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </Badge>
                        <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );

  /* ─────────── Render: Reviews ─────────── */

  const renderReviews = () => (
    <div className="space-y-6">
      {renderPageHeader("Reviews", "Moderate and manage product reviews")}

      {/* Filter */}
      <Tabs value={reviewApprovedFilter} onValueChange={(v) => { setReviewApprovedFilter(v); setReviewsPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="true">Approved</TabsTrigger>
          <TabsTrigger value="false">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {reviewsLoading ? (
            <div className="p-6">{renderSkeleton(8)}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="min-w-0 max-w-[160px]">
                          <p className="text-sm font-medium truncate">{review.product?.title || review.productId || "Unknown"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[9px] bg-gray-200">{getInitials(review.author)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{review.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating, 13)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="text-sm text-gray-600 max-w-xs truncate">{review.comment}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${review.approved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                          {review.approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-gray-500">{formatDate(review.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleReviewApproval(review)}>
                              {review.approved ? <XCircle size={14} className="mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
                              {review.approved ? "Unapprove" : "Approve"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditReview(review)}>
                              <Pencil size={14} className="mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteReviewDialog(review)}>
                              <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Review Dialog */}
      <Dialog open={!!editReviewDialog} onOpenChange={() => setEditReviewDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>Modify review content and approval status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Author</Label>
              <Input value={reviewFormAuthor} onChange={(e) => setReviewFormAuthor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rating: {reviewFormRating.toFixed(1)}</Label>
              <Slider value={[reviewFormRating]} min={1} max={5} step={0.5} onValueChange={([v]) => setReviewFormRating(v)} />
              <div className="mt-1">{renderStars(reviewFormRating, 16)}</div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea value={reviewFormComment} onChange={(e) => setReviewFormComment(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="text-sm font-medium">Approved</Label>
                <p className="text-xs text-gray-500">Make this review visible to customers</p>
              </div>
              <Switch checked={reviewFormApproved} onCheckedChange={setReviewFormApproved} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReviewDialog(null)}>Cancel</Button>
            <Button onClick={saveReview} className="bg-purple-950 hover:bg-purple-800">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Confirmation */}
      <AlertDialog open={!!deleteReviewDialog} onOpenChange={() => setDeleteReviewDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review by &quot;{deleteReviewDialog?.author}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteReviewDialog && deleteReview(deleteReviewDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  /* ─────────── Render: Content ─────────── */

  const renderContent = () => (
    <div className="space-y-6">
      {renderPageHeader("Content", "Manage hero slides and announcements")}

      <Tabs defaultValue="slides">
        <TabsList>
          <TabsTrigger value="slides">Hero Slides</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Hero Slides Tab */}
        <TabsContent value="slides" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetSlideForm(); setSlideDialogOpen(true); }} className="bg-purple-950 hover:bg-purple-800">
              <Plus size={16} className="mr-2" /> Add Slide
            </Button>
          </div>

          {contentLoading ? (
            renderSkeleton(4)
          ) : heroSlides.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ImagePlus size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hero slides</p>
              <p className="text-sm mt-1">Add slides to the homepage carousel</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {heroSlides.map((slide) => (
                <Card key={slide.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto relative flex-shrink-0">
                      <Image src={slide.image} alt={slide.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">#{slide.order}</Badge>
                          <Badge className={`text-[10px] ${slide.active ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-500 border-0"}`}>
                            {slide.active ? "Active" : "Inactive"}
                          </Badge>
                          {slide.accent && (
                            <Badge className="bg-purple-950/10 text-purple-950 border-0 text-[10px]">{slide.accent}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm">{slide.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{slide.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => openEditSlide(slide)}>
                          <Pencil size={14} className="mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteSlideDialog(slide)}>
                          <Trash2 size={14} className="mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetAnnouncementForm(); setAnnouncementDialogOpen(true); }} className="bg-purple-950 hover:bg-purple-800">
              <Plus size={16} className="mr-2" /> Add Announcement
            </Button>
          </div>

          {contentLoading ? (
            renderSkeleton(4)
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Card key={ann.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <GripVertical size={16} />
                      <span className="font-mono text-xs">#{ann.order}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ann.message}</p>
                    </div>
                    <Badge className={`text-[10px] ${ann.active ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-500 border-0"}`}>
                      {ann.active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditAnnouncement(ann)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteAnnouncementDialog(ann)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Slide Dialog */}
      <Dialog open={slideDialogOpen} onOpenChange={(open) => { setSlideDialogOpen(open); if (!open) resetSlideForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
            <DialogDescription>Configure the slide for the homepage carousel</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="/images/your-slide.jpg" value={slideFormImage} onChange={(e) => setSlideFormImage(e.target.value)} />
              {slideFormImage && (
                <div className="h-32 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={slideFormImage} alt="Preview" width={600} height={200} className="w-full h-full object-cover" unoptimized />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Slide title" value={slideFormTitle} onChange={(e) => setSlideFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subtitle *</Label>
              <Input placeholder="Slide subtitle" value={slideFormSubtitle} onChange={(e) => setSlideFormSubtitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Accent Label</Label>
                <Input placeholder="e.g. New, Hot, Sale" value={slideFormAccent} onChange={(e) => setSlideFormAccent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={slideFormOrder} onChange={(e) => setSlideFormOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-gray-500">Show this slide in the carousel</p>
              </div>
              <Switch checked={slideFormActive} onCheckedChange={setSlideFormActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSlideDialogOpen(false); resetSlideForm(); }}>Cancel</Button>
            <Button onClick={saveSlide} className="bg-purple-950 hover:bg-purple-800">
              {editingSlide ? "Update Slide" : "Create Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slide Confirmation */}
      <AlertDialog open={!!deleteSlideDialog} onOpenChange={() => setDeleteSlideDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the slide &quot;{deleteSlideDialog?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteSlideDialog && deleteSlide(deleteSlideDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={(open) => { setAnnouncementDialogOpen(open); if (!open) resetAnnouncementForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}</DialogTitle>
            <DialogDescription>Configure the announcement banner message</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Message *</Label>
              <Input placeholder="Announcement message..." value={annFormMessage} onChange={(e) => setAnnFormMessage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={annFormOrder} onChange={(e) => setAnnFormOrder(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-gray-500">Show this announcement in the banner</p>
              </div>
              <Switch checked={annFormActive} onCheckedChange={setAnnFormActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAnnouncementDialogOpen(false); resetAnnouncementForm(); }}>Cancel</Button>
            <Button onClick={saveAnnouncement} className="bg-purple-950 hover:bg-purple-800">
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Announcement Confirmation */}
      <AlertDialog open={!!deleteAnnouncementDialog} onOpenChange={() => setDeleteAnnouncementDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteAnnouncementDialog && deleteAnnouncement(deleteAnnouncementDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  /* ─────────── Render: Settings ─────────── */

  const renderSettings = () => (
    <div className="space-y-6">
      {renderPageHeader("Settings", "Configure your store settings")}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Site Settings</CardTitle>
          <CardDescription>Manage your store&apos;s general configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            renderSkeleton(5)
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="setting-siteName">Site Name</Label>
                  <Input
                    id="setting-siteName"
                    value={settings.siteName || ""}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="Akihabara TCG Warehouse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-whatsapp">WhatsApp Number</Label>
                  <Input
                    id="setting-whatsapp"
                    value={settings.whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="+81 90-1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-currency">Default Currency</Label>
                  <Select
                    value={settings.currency || "USD"}
                    onValueChange={(v) => setSettings({ ...settings, currency: v })}
                  >
                    <SelectTrigger id="setting-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                      <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                      <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-jpyRate">JPY Rate (to 1 USD)</Label>
                  <Input
                    id="setting-jpyRate"
                    type="number"
                    step="0.1"
                    value={settings.jpyRate || "149.5"}
                    onChange={(e) => setSettings({ ...settings, jpyRate: e.target.value })}
                    placeholder="149.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-eurRate">EUR Rate (to 1 USD)</Label>
                  <Input
                    id="setting-eurRate"
                    type="number"
                    step="0.01"
                    value={settings.eurRate || "0.92"}
                    onChange={(e) => setSettings({ ...settings, eurRate: e.target.value })}
                    placeholder="0.92"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-gbpRate">GBP Rate (to 1 USD)</Label>
                  <Input
                    id="setting-gbpRate"
                    type="number"
                    step="0.01"
                    value={settings.gbpRate || "0.79"}
                    onChange={(e) => setSettings({ ...settings, gbpRate: e.target.value })}
                    placeholder="0.79"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">Store Data</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    The catalog lives in this store&apos;s repository and loads automatically. Sample orders/reviews can be cleared here.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={exportCatalog}>
                    <Download size={14} className="mr-2" /> Export catalog
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                    <Upload size={14} className="mr-2" /> Import catalog
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRefreshFromLive}>
                    <RefreshCw size={14} className="mr-2" /> Re-sync from live store
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={unpublishedCount === 0} className="text-amber-700 border-amber-200 hover:bg-amber-50">
                    Discard local edits ({unpublishedCount})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearSampleData} className="text-gray-600">
                    Clear sample data
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveSettings} disabled={settingsSaving} className="bg-purple-950 hover:bg-purple-800 min-w-32">
                  {settingsSaving && <RefreshCw className="animate-spin mr-2" size={14} />}
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Store Sync (GitHub) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Github size={18} className="text-purple-950" />
            <CardTitle className="text-base">Live Store Sync (GitHub)</CardTitle>
          </div>
          <CardDescription>
            Connect your GitHub account so the Publish button can push catalog changes to the live store (the store rebuilds automatically, usually within a few minutes).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="rounded-lg bg-purple-50 border border-purple-100 p-4 text-xs text-purple-900 space-y-1.5">
              <p className="font-semibold">How to get a token (one time, ~2 minutes):</p>
              <p>1. On GitHub, open <span className="font-mono bg-white/70 rounded px-1">Settings → Developer settings → Fine-grained tokens → Generate new token</span></p>
              <p>2. <span className="font-medium">Repository access:</span> select <span className="font-mono bg-white/70 rounded px-1">Only select repositories</span> → <span className="font-mono bg-white/70 rounded px-1">AKIHABARATCGWAREHOUSE</span></p>
              <p>3. <span className="font-medium">Permissions → Repository permissions → Contents:</span> set to <span className="font-medium">Read and write</span> (nothing else needed)</p>
              <p>4. Generate, copy the token, and paste it below. It is stored only in this browser (localStorage) — never in the site code.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gh-token">GitHub Access Token</Label>
              <Input
                id="gh-token"
                type="password"
                placeholder="github_pat_… (fine-grained, Contents: Read & Write)"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gh-owner">Owner</Label>
                <Input id="gh-owner" value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="Zionimagodei2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gh-repo">Repository</Label>
                <Input id="gh-repo" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="AKIHABARATCGWAREHOUSE" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gh-branch">Branch</Label>
                <Input id="gh-branch" value={ghBranch} onChange={(e) => setGhBranch(e.target.value)} placeholder="main" />
              </div>
            </div>

            {ghTestResult && (
              <div className={`text-sm rounded-md p-3 border flex items-start gap-2 ${ghTestResult.ok ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                {ghTestResult.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                {ghTestResult.message}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={testGitHubConnection} disabled={ghTesting}>
                {ghTesting ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Globe size={14} className="mr-2" />}
                Test connection
              </Button>
              <Button onClick={saveGitHubConnection} className="bg-purple-950 hover:bg-purple-800">
                Save connection
              </Button>
              {adminStore.github?.token && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-7">
                  <CheckCircle2 size={12} className="mr-1" /> Token saved in this browser
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /* ─────────── Main Layout ─────────── */

  return (
    <div className="min-h-screen bg-gray-50/80 overflow-x-hidden">
      {renderSidebar()}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b px-4 lg:px-8 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
          {/* Publish status + action */}
          {publishStatus.state === "waiting" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
              Rebuilding the live store…
            </span>
          )}
          {publishStatus.state === "live" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
              <CheckCircle2 size={12} /> Changes are live
            </span>
          )}
          {publishStatus.state === "error" && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 truncate max-w-[220px]">
              <AlertTriangle size={12} /> {publishStatus.message}
            </span>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePublish}
              disabled={publishing || publishStatus.state === "publishing" || unpublishedCount === 0}
              className="bg-purple-950 hover:bg-purple-800"
              size="sm"
            >
              {publishing || publishStatus.state === "publishing" ? (
                <RefreshCw className="animate-spin mr-2" size={14} />
              ) : (
                <CloudUpload size={14} className="mr-1.5" />
              )}
              Publish
              {unpublishedCount > 0 && (
                <Badge className="ml-1.5 bg-amber-400 text-black text-[10px] h-5 px-1.5 border-0">
                  {unpublishedCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setActivePage("dashboard"); handleRefreshFromLive(); }} className="text-gray-500">
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px] bg-purple-950 text-white">{getInitials(adminUser?.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">{adminUser?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === "dashboard" && renderDashboard()}
              {activePage === "products" && renderProducts()}
              {activePage === "orders" && renderOrders()}
              {activePage === "customers" && renderCustomers()}
              {activePage === "reviews" && renderReviews()}
              {activePage === "content" && renderContent()}
              {activePage === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
