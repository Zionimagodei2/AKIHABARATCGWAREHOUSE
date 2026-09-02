import AdminPanel from "@/components/admin-panel";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata = {
  title: "Admin Panel — Akihabara TCG Warehouse",
};

export default function AdminPage() {
  return <AdminPanel />;
}
