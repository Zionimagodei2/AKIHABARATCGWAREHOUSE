"use client";

/* ────────────────────────────────────────────────────────────
   Admin editors for the full site content (Pages, Sets/Guides/
   Calendar, Blog Posts) + Publications restore + media upload.

   Content editors read/write the server draft through
   adminStore (draft autosaves to /api/admin/draft; nothing goes
   live until Publish). Blog posts and publications talk to
   their own API routes. All layouts are single-column first so
   they work on a phone.
   ──────────────────────────────────────────────────────────── */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Upload,
  CheckCircle2,
  History,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminStore } from "@/lib/admin-store";
import type {
  SiteContent,
  SiteSettings,
  IconCard,
  BlogPostData,
  BlogSectionData,
  PaymentMethod,
  CalendarEntry,
} from "@/lib/content-types";

export const ICON_NAMES = [
  "Shield",
  "Truck",
  "Globe",
  "Package",
  "Heart",
  "Star",
  "Mail",
  "Clock",
  "MapPin",
] as const;

type QA = { q: string; a: string };
type HtmlSection = { heading?: string; html: string };

/* ─────────── Small field primitives ─────────── */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="min-h-0 field-sizing-content"
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

export function StrListEditor({
  label,
  value,
  onChange,
  itemLabel = "Line",
  textarea = false,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  itemLabel?: string;
  textarea?: boolean;
}) {
  const list = value ?? [];
  const set = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          {textarea ? (
            <Textarea value={item} onChange={(e) => set(i, e.target.value)} rows={2} className="min-h-0 flex-1" />
          ) : (
            <Input value={item} onChange={(e) => set(i, e.target.value)} className="flex-1" />
          )}
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => move(i, -1)} aria-label={`Move ${itemLabel} up`}>
            <ArrowUp size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => move(i, 1)} aria-label={`Move ${itemLabel} down`}>
            <ArrowDown size={14} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label={`Delete ${itemLabel}`}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, ""])}>
        <Plus size={14} className="mr-1" /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

export function FaqEditor({
  label = "FAQs",
  value,
  onChange,
}: {
  label?: string;
  value: QA[];
  onChange: (v: QA[]) => void;
}) {
  const list = value ?? [];
  const patch = (i: number, p: Partial<QA>) =>
    onChange(list.map((f, j) => (j === i ? { ...f, ...p } : f)));
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((f, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Input value={f.q} onChange={(e) => patch(i, { q: e.target.value })} placeholder="Question" className="flex-1 bg-white" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete FAQ">
              <Trash2 size={14} />
            </Button>
          </div>
          <Textarea value={f.a} onChange={(e) => patch(i, { a: e.target.value })} placeholder="Answer" rows={3} className="min-h-0 bg-white" />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { q: "", a: "" }])}>
        <Plus size={14} className="mr-1" /> Add FAQ
      </Button>
    </div>
  );
}

export function IconCardsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IconCard[];
  onChange: (v: IconCard[]) => void;
}) {
  const list = value ?? [];
  const patch = (i: number, p: Partial<IconCard>) =>
    onChange(list.map((c, j) => (j === i ? { ...c, ...p } : c)));
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((c, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Select value={c.icon} onValueChange={(v) => patch(i, { icon: v })}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_NAMES.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={c.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Title" className="flex-1 bg-white" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete card">
              <Trash2 size={14} />
            </Button>
          </div>
          <Textarea value={c.desc} onChange={(e) => patch(i, { desc: e.target.value })} placeholder="Description" rows={2} className="min-h-0 bg-white" />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { icon: "Shield", title: "", desc: "" }])}>
        <Plus size={14} className="mr-1" /> Add card
      </Button>
    </div>
  );
}

/** Sections whose body is a single text block (shipping policy). */
export function TextSectionsEditor({
  label = "Sections",
  value,
  onChange,
}: {
  label?: string;
  value: { title: string; content: string }[];
  onChange: (v: { title: string; content: string }[]) => void;
}) {
  const list = value ?? [];
  const patch = (i: number, p: Partial<{ title: string; content: string }>) =>
    onChange(list.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((s, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Input value={s.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Section title" className="flex-1 bg-white font-medium" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete section">
              <Trash2 size={14} />
            </Button>
          </div>
          <Textarea value={s.content} onChange={(e) => patch(i, { content: e.target.value })} rows={5} className="min-h-0 bg-white" placeholder="Section text" />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { title: "", content: "" }])}>
        <Plus size={14} className="mr-1" /> Add section
      </Button>
    </div>
  );
}

/** Sections whose body is HTML (set hubs + buying guides). */
export function HtmlSectionsEditor({
  label = "Sections",
  value,
  onChange,
}: {
  label?: string;
  value: HtmlSection[];
  onChange: (v: HtmlSection[]) => void;
}) {
  const list = value ?? [];
  const patch = (i: number, p: Partial<HtmlSection>) =>
    onChange(list.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((s, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Input value={s.heading ?? ""} onChange={(e) => patch(i, { heading: e.target.value || undefined })} placeholder="Section heading (optional)" className="flex-1 bg-white font-medium" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete section">
              <Trash2 size={14} />
            </Button>
          </div>
          <Textarea value={s.html} onChange={(e) => patch(i, { html: e.target.value })} rows={6} className="min-h-0 bg-white font-mono text-xs" placeholder="Section HTML" />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { heading: "", html: "" }])}>
        <Plus size={14} className="mr-1" /> Add section
      </Button>
    </div>
  );
}

/** Label/value pair lists (set-hub facts, related links). */
export function PairListEditor({
  label,
  value,
  onChange,
  firstPlaceholder,
  secondPlaceholder,
}: {
  label: string;
  value: [string, string][];
  onChange: (v: [string, string][]) => void;
  firstPlaceholder: string;
  secondPlaceholder: string;
}) {
  const list = value ?? [];
  const set = (i: number, idx: 0 | 1, v: string) =>
    onChange(list.map((p, j) => (j === i ? (idx === 0 ? [v, p[1]] : [p[0], v]) as [string, string] : p)));
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((p, i) => (
        <div key={i} className="flex gap-2">
          <Input value={p[0]} onChange={(e) => set(i, 0, e.target.value)} placeholder={firstPlaceholder} className="flex-1" />
          <Input value={p[1]} onChange={(e) => set(i, 1, e.target.value)} placeholder={secondPlaceholder} className="flex-1" />
          <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500 shrink-0" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete row">
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, ["", ""]])}>
        <Plus size={14} className="mr-1" /> Add row
      </Button>
    </div>
  );
}

export function RelatedLinksEditor({
  label = "Related links",
  value,
  onChange,
}: {
  label?: string;
  value: { label: string; href: string }[];
  onChange: (v: { label: string; href: string }[]) => void;
}) {
  const pairs: [string, string][] = (value ?? []).map((r) => [r.label, r.href]);
  return (
    <PairListEditor
      label={label}
      value={pairs}
      onChange={(v) => onChange(v.map(([label, href]) => ({ label, href })))}
      firstPlaceholder="Link text"
      secondPlaceholder="/path/"
    />
  );
}

/** Key/value record editor (category section titles/descriptions). */
export function RecordEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, string> | undefined;
  onChange: (v: Record<string, string>) => void;
}) {
  const entries = Object.entries(value ?? {});
  const commit = (ents: [string, string][]) => onChange(Object.fromEntries(ents));
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {entries.map(([k, v], i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={k}
            onChange={(e) => {
              const next = [...entries];
              next[i] = [e.target.value, v];
              commit(next);
            }}
            placeholder="Subcategory name"
            className="flex-1"
          />
          <Input
            value={v}
            onChange={(e) => {
              const next = [...entries];
              next[i] = [k, e.target.value];
              commit(next);
            }}
            placeholder="Text"
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500 shrink-0" onClick={() => commit(entries.filter((_, j) => j !== i))} aria-label="Delete row">
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => commit([...entries, ["", ""]])}>
        <Plus size={14} className="mr-1" /> Add row
      </Button>
    </div>
  );
}

/* ─────────── Media upload ─────────── */

function downscaleImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      URL.revokeObjectURL(url);
      if (scale === 1 && file.size < 2_500_000) {
        resolve(file);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => resolve(b ?? file), "image/webp", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function uploadMedia(file: File): Promise<string> {
  const blob = await downscaleImage(file);
  const form = new FormData();
  form.append("file", blob, file.name || "upload");
  const res = await fetch("/api/admin/media", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) throw new Error(data?.error || "Upload failed");
  return data.url as string;
}

export function MediaField({
  label,
  value,
  onChange,
  kind = "image",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind?: "image" | "video";
  hint?: string;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file);
      onChange(url);
      toast({ title: "Uploaded", description: "Media saved to the site library" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === "video" ? "https://… or upload a file" : "/images/… or upload a file"}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()} className="shrink-0">
          {busy ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
          <span className="ml-1.5 hidden sm:inline">Upload</span>
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={kind === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {kind === "image" && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-1 h-20 w-auto rounded border object-cover" />
      ) : null}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

/* ─────────── Shared content-loading hook ─────────── */

function useSiteContentDraft() {
  const [content, setContent] = useState<SiteContent | null>(null);
  useEffect(() => {
    let on = true;
    adminStore.ready().then(() => {
      const full = adminStore.getFullContent();
      if (on && full) setContent(JSON.parse(JSON.stringify(full)) as SiteContent);
    });
    return () => {
      on = false;
    };
  }, []);
  return [content, setContent] as const;
}

function SaveBar({ onSave, label = "Save to draft" }: { onSave: () => void; label?: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="button" onClick={onSave} className="bg-purple-950 hover:bg-purple-800">
        <CheckCircle2 size={14} className="mr-1.5" /> {label}
      </Button>
      <span className="text-xs text-gray-400">Saved to your draft — press Publish (top bar) to go live.</span>
    </div>
  );
}

/* ─────────── Pages editor ─────────── */

const PAGE_SECTIONS = [
  { key: "home", label: "Home page" },
  { key: "about", label: "About page" },
  { key: "shipping", label: "Shipping page" },
  { key: "faq", label: "FAQ page" },
  { key: "contact", label: "Contact page" },
  { key: "footer", label: "Footer" },
  { key: "checkout", label: "Checkout" },
  { key: "categoryPages", label: "Category pages" },
  { key: "seo", label: "SEO & site identity" },
  { key: "blog", label: "Blog wording" },
] as const;

export function PagesEditor() {
  const { toast } = useToast();
  const [content, setContent] = useSiteContentDraft();
  const [section, setSection] = useState<string>("home");
  const [category, setCategory] = useState<string>("");

  if (!content) return <p className="text-sm text-gray-500 py-8 text-center">Loading page content…</p>;

  const catKeys = Object.keys(content.categoryPages);
  const activeCategory = category && content.categoryPages[category] ? category : catKeys[0];

  const save = (key: keyof SiteContent) => {
    adminStore.setContentKey(key, content[key]);
    toast({ title: "Saved to draft", description: "Press Publish in the top bar to make it live" });
  };
  const patch = <K extends keyof SiteContent>(key: K, p: Partial<SiteContent[K]>) =>
    setContent({ ...content, [key]: { ...(content[key] as object), ...p } });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
        <p className="text-sm text-gray-500">Edit the words and pictures on every page of the store. Changes save to your draft; Publish makes them live. (Hero slides and announcements live under Content.)</p>
      </div>
      <div className="max-w-xs">
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SECTIONS.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {section === "home" && (
            <>
              <TextField label="Warehouse strip eyebrow" value={content.home.warehouseEyebrow} onChange={(v) => patch("home", { warehouseEyebrow: v })} />
              <TextField label="Warehouse strip title" value={content.home.warehouseTitle} onChange={(v) => patch("home", { warehouseTitle: v })} />
              <StrListEditor label="Warehouse strip images (URLs)" itemLabel="Image URL" value={content.home.warehouseTrackImages} onChange={(v) => patch("home", { warehouseTrackImages: v })} />
              <MediaField label="Wide warehouse photo" value={content.home.warehouseWideImage} onChange={(v) => patch("home", { warehouseWideImage: v })} />
              <TextField label="Wide photo alt text" value={content.home.warehouseWideAlt} onChange={(v) => patch("home", { warehouseWideAlt: v })} />
              <IconCardsEditor label="Trust badges (under the hero)" value={content.home.trustBadges} onChange={(v) => patch("home", { trustBadges: v })} />
              <TextField label="Collection eyebrow" value={content.home.collectionEyebrow} onChange={(v) => patch("home", { collectionEyebrow: v })} />
              <TextField label="Collection title" value={content.home.collectionTitle} onChange={(v) => patch("home", { collectionTitle: v })} />
              <AreaField label="Collection subtitle" value={content.home.collectionSub} onChange={(v) => patch("home", { collectionSub: v })} />
              <TextField label="'Why choose us' eyebrow" value={content.home.whyEyebrow} onChange={(v) => patch("home", { whyEyebrow: v })} />
              <TextField label="'Why choose us' title" value={content.home.whyTitle} onChange={(v) => patch("home", { whyTitle: v })} />
              <AreaField label="'Why choose us' intro" value={content.home.whyIntro} onChange={(v) => patch("home", { whyIntro: v })} />
              <IconCardsEditor label="'Why choose us' features" value={content.home.features} onChange={(v) => patch("home", { features: v })} />
              <TextField label="'Every box includes' title" value={content.home.includesTitle} onChange={(v) => patch("home", { includesTitle: v })} />
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-600">Includes list</Label>
                {content.home.includes.map((inc, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <Input value={inc.title} onChange={(e) => patch("home", { includes: content.home.includes.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="Title" className="flex-1 bg-white" />
                      <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => patch("home", { includes: content.home.includes.filter((_, j) => j !== i) })} aria-label="Delete item"><Trash2 size={14} /></Button>
                    </div>
                    <Textarea value={inc.desc} onChange={(e) => patch("home", { includes: content.home.includes.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} rows={2} className="min-h-0 bg-white" placeholder="Description" />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => patch("home", { includes: [...content.home.includes, { title: "", desc: "" }] })}>
                  <Plus size={14} className="mr-1" /> Add item
                </Button>
              </div>
              <TextField label="Reviews eyebrow" value={content.home.reviewsEyebrow} onChange={(v) => patch("home", { reviewsEyebrow: v })} />
              <TextField label="Reviews title" value={content.home.reviewsTitle} onChange={(v) => patch("home", { reviewsTitle: v })} />
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-600">Homepage reviews</Label>
                {content.home.reviews.map((r, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
                    <div className="flex gap-2">
                      <Input value={r.name} onChange={(e) => patch("home", { reviews: content.home.reviews.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} placeholder="Name" className="flex-1 bg-white" />
                      <Input type="number" min={1} max={5} value={r.rating} onChange={(e) => patch("home", { reviews: content.home.reviews.map((x, j) => (j === i ? { ...x, rating: parseInt(e.target.value) || 5 } : x)) })} className="w-20 bg-white" aria-label="Star rating" />
                      <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => patch("home", { reviews: content.home.reviews.filter((_, j) => j !== i) })} aria-label="Delete review"><Trash2 size={14} /></Button>
                    </div>
                    <Textarea value={r.quote} onChange={(e) => patch("home", { reviews: content.home.reviews.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)) })} rows={2} className="min-h-0 bg-white" placeholder="Review text" />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => patch("home", { reviews: [...content.home.reviews, { name: "", quote: "", rating: 5 }] })}>
                  <Plus size={14} className="mr-1" /> Add review
                </Button>
              </div>
              <SaveBar onSave={() => save("home")} />
            </>
          )}

          {section === "about" && (
            <>
              <TextField label="Eyebrow" value={content.about.eyebrow} onChange={(v) => patch("about", { eyebrow: v })} />
              <TextField label="Page title" value={content.about.title} onChange={(v) => patch("about", { title: v })} />
              <AreaField label="Intro" rows={3} value={content.about.intro} onChange={(v) => patch("about", { intro: v })} />
              <TextField label="Purpose eyebrow" value={content.about.purposeEyebrow} onChange={(v) => patch("about", { purposeEyebrow: v })} />
              <TextField label="Purpose title" value={content.about.purposeTitle} onChange={(v) => patch("about", { purposeTitle: v })} />
              <StrListEditor label="Purpose paragraphs" itemLabel="Paragraph" textarea value={content.about.purposeParagraphs} onChange={(v) => patch("about", { purposeParagraphs: v })} />
              <TextField label="Trust section title" value={content.about.trustTitle} onChange={(v) => patch("about", { trustTitle: v })} />
              <IconCardsEditor label="Trust items" value={content.about.trustItems} onChange={(v) => patch("about", { trustItems: v })} />
              <TextField label="'What we carry' eyebrow" value={content.about.carryEyebrow} onChange={(v) => patch("about", { carryEyebrow: v })} />
              <TextField label="'What we carry' title" value={content.about.carryTitle} onChange={(v) => patch("about", { carryTitle: v })} />
              <IconCardsEditor label="'What we carry' items" value={content.about.carryItems} onChange={(v) => patch("about", { carryItems: v })} />
              <TextField label="Guarantee title" value={content.about.guaranteeTitle} onChange={(v) => patch("about", { guaranteeTitle: v })} />
              <StrListEditor label="Guarantee paragraphs" itemLabel="Paragraph" textarea value={content.about.guaranteeParagraphs} onChange={(v) => patch("about", { guaranteeParagraphs: v })} />
              <SaveBar onSave={() => save("about")} />
            </>
          )}

          {section === "shipping" && (
            <>
              <TextField label="Eyebrow" value={content.shipping.eyebrow} onChange={(v) => patch("shipping", { eyebrow: v })} />
              <TextField label="Page title" value={content.shipping.title} onChange={(v) => patch("shipping", { title: v })} />
              <AreaField label="Intro" value={content.shipping.intro} onChange={(v) => patch("shipping", { intro: v })} />
              <TextSectionsEditor label="Policy sections" value={content.shipping.sections} onChange={(v) => patch("shipping", { sections: v })} />
              <p className="text-[11px] text-gray-400">Tip: write {"{threshold}"} in a section where the free-shipping amount should appear — it always shows the current Settings value.</p>
              <SaveBar onSave={() => save("shipping")} />
            </>
          )}

          {section === "faq" && (
            <>
              <TextField label="Eyebrow" value={content.faq.eyebrow} onChange={(v) => patch("faq", { eyebrow: v })} />
              <TextField label="Page title" value={content.faq.title} onChange={(v) => patch("faq", { title: v })} />
              <AreaField label="Intro" value={content.faq.intro} onChange={(v) => patch("faq", { intro: v })} />
              <FaqEditor label="Questions & answers (also used for the home page FAQ schema)" value={content.faq.items} onChange={(v) => patch("faq", { items: v })} />
              <SaveBar onSave={() => save("faq")} />
            </>
          )}

          {section === "contact" && (
            <>
              <TextField label="Eyebrow" value={content.contact.eyebrow} onChange={(v) => patch("contact", { eyebrow: v })} />
              <TextField label="Page title" value={content.contact.title} onChange={(v) => patch("contact", { title: v })} />
              <AreaField label="Intro" value={content.contact.intro} onChange={(v) => patch("contact", { intro: v })} />
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-600">Contact cards</Label>
                {content.contact.cards.map((c, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <Select value={c.icon} onValueChange={(v) => patch("contact", { cards: content.contact.cards.map((x, j) => (j === i ? { ...x, icon: v } : x)) })}>
                        <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ICON_NAMES.map((n) => (
                            <SelectItem key={n} value={n}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={c.title} onChange={(e) => patch("contact", { cards: content.contact.cards.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} placeholder="Card title" className="flex-1 bg-white" />
                      <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => patch("contact", { cards: content.contact.cards.filter((_, j) => j !== i) })} aria-label="Delete card"><Trash2 size={14} /></Button>
                    </div>
                    <Input value={c.detail} onChange={(e) => patch("contact", { cards: content.contact.cards.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)) })} placeholder="Main line (e.g. the email address)" className="bg-white" />
                    <Input value={c.sub} onChange={(e) => patch("contact", { cards: content.contact.cards.map((x, j) => (j === i ? { ...x, sub: e.target.value } : x)) })} placeholder="Small line underneath" className="bg-white" />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => patch("contact", { cards: [...content.contact.cards, { icon: "Mail", title: "", detail: "", sub: "" }] })}>
                  <Plus size={14} className="mr-1" /> Add card
                </Button>
              </div>
              <TextField label="Form title" value={content.contact.formTitle} onChange={(v) => patch("contact", { formTitle: v })} />
              <TextField label="Chat bubble label (floating button)" value={content.contact.chatBubble} onChange={(v) => patch("contact", { chatBubble: v })} />
              <TextField label="Chat window title" value={content.contact.chatTitle} onChange={(v) => patch("contact", { chatTitle: v })} />
              <TextField label="Chat window status" value={content.contact.chatStatus} onChange={(v) => patch("contact", { chatStatus: v })} />
              <SaveBar onSave={() => save("contact")} />
            </>
          )}

          {section === "footer" && (
            <>
              <AreaField label="Footer blurb" rows={4} value={content.footer.blurb} onChange={(v) => patch("footer", { blurb: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField label="Navigation heading" value={content.footer.navHeading} onChange={(v) => patch("footer", { navHeading: v })} />
                <TextField label="Categories heading" value={content.footer.categoriesHeading} onChange={(v) => patch("footer", { categoriesHeading: v })} />
                <TextField label="Contact heading" value={content.footer.contactHeading} onChange={(v) => patch("footer", { contactHeading: v })} />
              </div>
              <TextField label="Email line — small text under the address" value={content.footer.emailSub} onChange={(v) => patch("footer", { emailSub: v })} hint="The address itself comes from Settings → Store Email." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Opening hours" value={content.footer.hours} onChange={(v) => patch("footer", { hours: v })} />
                <TextField label="Hours — small line" value={content.footer.hoursSub} onChange={(v) => patch("footer", { hoursSub: v })} />
                <TextField label="Location" value={content.footer.location} onChange={(v) => patch("footer", { location: v })} />
                <TextField label="Location — small line" value={content.footer.locationSub} onChange={(v) => patch("footer", { locationSub: v })} />
              </div>
              <TextField label="Copyright line" value={content.footer.copyrightText} onChange={(v) => patch("footer", { copyrightText: v })} hint="Rendered after the year, e.g. 'Akihabara TCG Warehouse. All rights reserved.'" />
              <StrListEditor label="Trust badges (bottom row)" itemLabel="Badge" value={content.footer.badges} onChange={(v) => patch("footer", { badges: v })} />
              <SaveBar onSave={() => save("footer")} />
            </>
          )}

          {section === "checkout" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Eyebrow (back link text)" value={content.checkout.eyebrow} onChange={(v) => patch("checkout", { eyebrow: v })} />
                <TextField label="Page title" value={content.checkout.title} onChange={(v) => patch("checkout", { title: v })} />
              </div>
              <AreaField label="Intro text (HTML allowed)" rows={3} value={content.checkout.introHtml} onChange={(v) => patch("checkout", { introHtml: v })} />
              <TextField label="Empty-cart title" value={content.checkout.emptyTitle} onChange={(v) => patch("checkout", { emptyTitle: v })} />
              <AreaField label="Empty-cart text" value={content.checkout.emptyText} onChange={(v) => patch("checkout", { emptyText: v })} />
              <TextField label="Thank-you title" value={content.checkout.thankYouTitle} onChange={(v) => patch("checkout", { thankYouTitle: v })} />
              <TextField label="Order reference label" value={content.checkout.thankYouRefLabel} onChange={(v) => patch("checkout", { thankYouRefLabel: v })} />
              <AreaField label="Thank-you text — WhatsApp opened (HTML allowed)" rows={3} value={content.checkout.thankYouTextWa} onChange={(v) => patch("checkout", { thankYouTextWa: v })} />
              <AreaField label="Thank-you text — WhatsApp blocked (HTML allowed)" rows={3} value={content.checkout.thankYouTextNoWa} onChange={(v) => patch("checkout", { thankYouTextNoWa: v })} hint="{phone} is replaced with the store WhatsApp number." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Send-order button" value={content.checkout.sendButtonLabel} onChange={(v) => patch("checkout", { sendButtonLabel: v })} />
                <TextField label="Send-order button sub-line" value={content.checkout.sendButtonSub} onChange={(v) => patch("checkout", { sendButtonSub: v })} />
              </div>
              <AreaField label="WhatsApp order message template" rows={10} value={content.checkout.whatsappTemplate} onChange={(v) => patch("checkout", { whatsappTemplate: v })} hint="Placeholders: {orderId} {items} {subtotal} {shipping} {total} {name} {email} {phone} {address} {payment} {notesLine} {siteName}. Keep {items} and {total} — the order details ride on them." />
              <SaveBar onSave={() => save("checkout")} />
            </>
          )}

          {section === "categoryPages" && activeCategory && (
            <>
              <div className="max-w-xs">
                <Select value={activeCategory} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {catKeys.map((key) => (
                      <SelectItem key={key} value={key}>{content.categoryPages[key].h1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(() => {
                const c = content.categoryPages[activeCategory];
                const pc = (p: Partial<typeof c>) =>
                  setContent({ ...content, categoryPages: { ...content.categoryPages, [activeCategory]: { ...c, ...p } } });
                return (
                  <>
                    <TextField label="Browser tab title (meta title)" value={c.metaTitle} onChange={(v) => pc({ metaTitle: v })} />
                    <AreaField label="Meta description" value={c.metaDescription} onChange={(v) => pc({ metaDescription: v })} />
                    <StrListEditor label="Meta keywords" itemLabel="Keyword" value={c.keywords} onChange={(v) => pc({ keywords: v })} />
                    <TextField label="Eyebrow" value={c.eyebrow} onChange={(v) => pc({ eyebrow: v })} />
                    <TextField label="Page heading (H1)" value={c.h1} onChange={(v) => pc({ h1: v })} />
                    <AreaField label="Intro paragraph" rows={4} value={c.intro} onChange={(v) => pc({ intro: v })} hint="{count} is replaced with the live product count." />
                    <MediaField label="Hero image" value={c.heroImage} onChange={(v) => pc({ heroImage: v })} />
                    <StrListEditor label="Hero pills" itemLabel="Pill" value={c.heroPills} onChange={(v) => pc({ heroPills: v })} />
                    <p className="text-[11px] text-gray-400 -mt-1">Pills can use {"{count}"} for the product count and {"{threshold}"} for the free-shipping amount.</p>
                    <RecordEditor label="Subcategory section titles (optional overrides)" value={c.sectionTitles} onChange={(v) => pc({ sectionTitles: v })} />
                    <RecordEditor label="Subcategory section descriptions (optional)" value={c.sectionDescriptions} onChange={(v) => pc({ sectionDescriptions: v })} />
                    <TextField label="'Explore' heading (bottom links)" value={c.exploreTitle} onChange={(v) => pc({ exploreTitle: v })} />
                    <TextField label="Footer tagline" value={c.footerTagline} onChange={(v) => pc({ footerTagline: v })} />
                  </>
                );
              })()}
              <SaveBar onSave={() => save("categoryPages")} />
            </>
          )}

          {section === "seo" && (
            <>
              <TextField label="Default browser tab title" value={content.seo.title} onChange={(v) => patch("seo", { title: v })} />
              <AreaField label="Default meta description" rows={3} value={content.seo.description} onChange={(v) => patch("seo", { description: v })} />
              <StrListEditor label="Meta keywords" itemLabel="Keyword" value={content.seo.keywords} onChange={(v) => patch("seo", { keywords: v })} />
              <TextField label="Home page H1 (screen-reader / SEO)" value={content.seo.h1} onChange={(v) => patch("seo", { h1: v })} />
              <AreaField label="Store description (search schema)" rows={3} value={content.seo.storeDescription} onChange={(v) => patch("seo", { storeDescription: v })} />
              <TextField label="Accepted payment methods (schema line)" value={content.seo.paymentAccepted} onChange={(v) => patch("seo", { paymentAccepted: v })} />
              <SaveBar onSave={() => save("seo")} />
            </>
          )}

          {section === "blog" && (
            <>
              <TextField label="Blog browser tab title" value={content.blog.metaTitle} onChange={(v) => patch("blog", { metaTitle: v })} />
              <AreaField label="Blog meta description" rows={2} value={content.blog.metaDescription} onChange={(v) => patch("blog", { metaDescription: v })} />
              <TextField label="Blog index eyebrow" value={content.blog.eyebrow} onChange={(v) => patch("blog", { eyebrow: v })} />
              <TextField label="Blog index title" value={content.blog.title} onChange={(v) => patch("blog", { title: v })} />
              <AreaField label="Blog index intro" value={content.blog.intro} onChange={(v) => patch("blog", { intro: v })} />
              <TextField label="Author byline" value={content.blog.byline} onChange={(v) => patch("blog", { byline: v })} />
              <TextField label="Takeaway box title" value={content.blog.bottomLineTitle} onChange={(v) => patch("blog", { bottomLineTitle: v })} />
              <TextField label="Article CTA title" value={content.blog.ctaTitle} onChange={(v) => patch("blog", { ctaTitle: v })} />
              <AreaField label="Article CTA text" value={content.blog.ctaText} onChange={(v) => patch("blog", { ctaText: v })} />
              <TextField label="Article CTA button" value={content.blog.ctaLabel} onChange={(v) => patch("blog", { ctaLabel: v })} />
              <TextField label="Article FAQ heading" value={content.blog.faqTitle} onChange={(v) => patch("blog", { faqTitle: v })} />
              <TextField label="'Keep reading' heading" value={content.blog.relatedTitle} onChange={(v) => patch("blog", { relatedTitle: v })} />
              <SaveBar onSave={() => save("blog")} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── Sets / Guides / Calendar editor ─────────── */

export function EditorialEditor() {
  const { toast } = useToast();
  const [content, setContent] = useSiteContentDraft();
  const [tab, setTab] = useState<"sets" | "guides" | "calendar">("sets");
  const [hubSlug, setHubSlug] = useState<string>("");
  const [guideSlug, setGuideSlug] = useState<string>("");

  if (!content) return <p className="text-sm text-gray-500 py-8 text-center">Loading editorial content…</p>;

  const hubKeys = Object.keys(content.sets.hubs);
  const activeHub = hubSlug && content.sets.hubs[hubSlug] ? hubSlug : hubKeys[0];
  const guideKeys = Object.keys(content.guides.items);
  const activeGuide = guideSlug && content.guides.items[guideSlug] ? guideSlug : guideKeys[0];

  const save = (key: "sets" | "guides" | "calendar") => {
    adminStore.setContentKey(key, content[key]);
    toast({ title: "Saved to draft", description: "Press Publish in the top bar to make it live" });
  };
  const patchIndex = (which: "sets" | "guides", p: Partial<SiteContent["sets"]["index"]>) => {
    if (which === "sets") setContent({ ...content, sets: { ...content.sets, index: { ...content.sets.index, ...p } } });
    else setContent({ ...content, guides: { ...content.guides, index: { ...content.guides.index, ...p } } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Sets, Guides &amp; Calendar</h2>
        <p className="text-sm text-gray-500">The set guides, buying guides and release calendar. Saved to your draft; Publish makes them live.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["sets", "guides", "calendar"] as const).map((t) => (
          <Button key={t} type="button" size="sm" variant={tab === t ? "default" : "outline"} className={tab === t ? "bg-purple-950 hover:bg-purple-800" : ""} onClick={() => setTab(t)}>
            {t === "sets" ? "Set guides" : t === "guides" ? "Buying guides" : "Release calendar"}
          </Button>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {tab === "sets" && activeHub && (
            <>
              <TextField label="Sets index — browser tab title" value={content.sets.index.metaTitle} onChange={(v) => patchIndex("sets", { metaTitle: v })} />
              <AreaField label="Sets index — meta description" value={content.sets.index.metaDescription} onChange={(v) => patchIndex("sets", { metaDescription: v })} />
              <TextField label="Sets index — eyebrow" value={content.sets.index.eyebrow} onChange={(v) => patchIndex("sets", { eyebrow: v })} />
              <TextField label="Sets index — heading" value={content.sets.index.title} onChange={(v) => patchIndex("sets", { title: v })} />
              <AreaField label="Sets index — intro" value={content.sets.index.intro} onChange={(v) => patchIndex("sets", { intro: v })} />
              <div className="max-w-xs">
                <Label className="text-xs font-medium text-gray-600">Set guide</Label>
                <Select value={activeHub} onValueChange={setHubSlug}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hubKeys.map((k) => (
                      <SelectItem key={k} value={k}>{content.sets.hubs[k].h1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(() => {
                const hub = content.sets.hubs[activeHub];
                const ph = (p: Partial<typeof hub>) =>
                  setContent({ ...content, sets: { ...content.sets, hubs: { ...content.sets.hubs, [activeHub]: { ...hub, ...p } } } });
                return (
                  <>
                    <TextField label="Browser tab title" value={hub.metaTitle} onChange={(v) => ph({ metaTitle: v })} />
                    <AreaField label="Meta description" value={hub.metaDescription} onChange={(v) => ph({ metaDescription: v })} />
                    <TextField label="Eyebrow" value={hub.eyebrow} onChange={(v) => ph({ eyebrow: v })} />
                    <TextField label="Page heading (H1)" value={hub.h1} onChange={(v) => ph({ h1: v })} />
                    <AreaField label="Intro (HTML allowed)" rows={4} value={hub.introHtml} onChange={(v) => ph({ introHtml: v })} />
                    <PairListEditor label="Fact rows (label / value)" value={hub.facts} onChange={(v) => ph({ facts: v })} firstPlaceholder="Label, e.g. Release" secondPlaceholder="Value, e.g. Sept 16, 2026" />
                    <HtmlSectionsEditor label="Guide sections (HTML)" value={hub.sections} onChange={(v) => ph({ sections: v })} />
                    <TextField label="CTA title" value={hub.ctaTitle} onChange={(v) => ph({ ctaTitle: v })} />
                    <AreaField label="CTA subtitle" value={hub.ctaSub} onChange={(v) => ph({ ctaSub: v })} />
                    <StrListEditor label="Product slugs shown on this guide" itemLabel="Slug" value={hub.productSlugs} onChange={(v) => ph({ productSlugs: v })} />
                    <FaqEditor value={hub.faqs} onChange={(v) => ph({ faqs: v })} />
                    <RelatedLinksEditor value={hub.related} onChange={(v) => ph({ related: v })} />
                    <AreaField label="Source note" value={hub.sourceNote} onChange={(v) => ph({ sourceNote: v })} />
                  </>
                );
              })()}
              <SaveBar onSave={() => save("sets")} />
            </>
          )}

          {tab === "guides" && activeGuide && (
            <>
              <TextField label="Guides index — browser tab title" value={content.guides.index.metaTitle} onChange={(v) => patchIndex("guides", { metaTitle: v })} />
              <AreaField label="Guides index — meta description" value={content.guides.index.metaDescription} onChange={(v) => patchIndex("guides", { metaDescription: v })} />
              <TextField label="Guides index — eyebrow" value={content.guides.index.eyebrow} onChange={(v) => patchIndex("guides", { eyebrow: v })} />
              <TextField label="Guides index — heading" value={content.guides.index.title} onChange={(v) => patchIndex("guides", { title: v })} />
              <AreaField label="Guides index — intro" value={content.guides.index.intro} onChange={(v) => patchIndex("guides", { intro: v })} />
              <div className="max-w-xs">
                <Label className="text-xs font-medium text-gray-600">Guide</Label>
                <Select value={activeGuide} onValueChange={setGuideSlug}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {guideKeys.map((k) => (
                      <SelectItem key={k} value={k}>{content.guides.items[k].h1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(() => {
                const g = content.guides.items[activeGuide];
                const pg = (p: Partial<typeof g>) =>
                  setContent({ ...content, guides: { ...content.guides, items: { ...content.guides.items, [activeGuide]: { ...g, ...p } } } });
                return (
                  <>
                    <TextField label="Browser tab title" value={g.metaTitle} onChange={(v) => pg({ metaTitle: v })} />
                    <AreaField label="Meta description" value={g.metaDescription} onChange={(v) => pg({ metaDescription: v })} />
                    <TextField label="Page heading (H1)" value={g.h1} onChange={(v) => pg({ h1: v })} />
                    <TextField label="Meta line (under the heading)" value={g.meta} onChange={(v) => pg({ meta: v })} />
                    <AreaField label="Intro (HTML allowed)" rows={4} value={g.introHtml} onChange={(v) => pg({ introHtml: v })} />
                    <HtmlSectionsEditor label="Guide sections (HTML)" value={g.sections} onChange={(v) => pg({ sections: v })} />
                    <TextField label="CTA title" value={g.ctaTitle} onChange={(v) => pg({ ctaTitle: v })} />
                    <AreaField label="CTA subtitle" value={g.ctaSub} onChange={(v) => pg({ ctaSub: v })} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField label="CTA button label" value={g.ctaLabel} onChange={(v) => pg({ ctaLabel: v })} />
                      <TextField label="CTA button link" value={g.ctaHref} onChange={(v) => pg({ ctaHref: v })} />
                    </div>
                    <FaqEditor value={g.faqs} onChange={(v) => pg({ faqs: v })} />
                    <RelatedLinksEditor value={g.related} onChange={(v) => pg({ related: v })} />
                  </>
                );
              })()}
              <SaveBar onSave={() => save("guides")} />
            </>
          )}

          {tab === "calendar" && (
            <>
              <TextField label="Browser tab title" value={content.calendar.metaTitle} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, metaTitle: v } })} />
              <AreaField label="Meta description" value={content.calendar.metaDescription} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, metaDescription: v } })} />
              <TextField label="Social share title" value={content.calendar.ogTitle} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, ogTitle: v } })} />
              <AreaField label="Social share description" value={content.calendar.ogDescription} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, ogDescription: v } })} />
              <AreaField label="Article schema description" value={content.calendar.articleDescription} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, articleDescription: v } })} />
              <TextField label="Eyebrow" value={content.calendar.eyebrow} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, eyebrow: v } })} />
              <TextField label="Page heading (H1)" value={content.calendar.title} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, title: v } })} />
              <TextField label="'Updated' line" value={content.calendar.updatedLine} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, updatedLine: v } })} />
              <AreaField label="Intro" rows={3} value={content.calendar.intro} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, intro: v } })} />
              <TextField label="Upcoming section title" value={content.calendar.upcomingTitle} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, upcomingTitle: v } })} />
              <CalendarEntriesEditor label="Upcoming releases" value={content.calendar.upcoming} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, upcoming: v } })} />
              <TextField label="Recent section title" value={content.calendar.recentTitle} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, recentTitle: v } })} />
              <CalendarEntriesEditor label="Recent releases" value={content.calendar.recent} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, recent: v } })} />
              <TextField label="CTA title" value={content.calendar.ctaTitle} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, ctaTitle: v } })} />
              <AreaField label="CTA text" value={content.calendar.ctaText} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, ctaText: v } })} />
              <FaqEditor value={content.calendar.faqs} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, faqs: v } })} />
              <TextField label="Footnote" value={content.calendar.footnote} onChange={(v) => setContent({ ...content, calendar: { ...content.calendar, footnote: v } })} />
              <SaveBar onSave={() => save("calendar")} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarEntriesEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CalendarEntry[];
  onChange: (v: CalendarEntry[]) => void;
}) {
  const list = value ?? [];
  const patch = (i: number, p: Partial<CalendarEntry>) =>
    onChange(list.map((e, j) => (j === i ? { ...e, ...p } : e)));
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {list.map((e, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex gap-2">
            <Input value={e.date} onChange={(ev) => patch(i, { date: ev.target.value })} placeholder="Dec 12, 2026" className="flex-1 bg-white" />
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Delete entry"><Trash2 size={14} /></Button>
          </div>
          <div className="flex gap-2">
            <Input value={e.game} onChange={(ev) => patch(i, { game: ev.target.value })} placeholder="Game" className="flex-1 bg-white" />
            <Input value={e.set} onChange={(ev) => patch(i, { set: ev.target.value })} placeholder="Set name" className="flex-1 bg-white" />
          </div>
          <Input value={e.notes} onChange={(ev) => patch(i, { notes: ev.target.value })} placeholder="Notes" className="bg-white" />
          <Input value={e.href ?? ""} onChange={(ev) => patch(i, { href: ev.target.value || undefined })} placeholder="Link (optional, e.g. /sets/…)" className="bg-white" />
          <div className="flex gap-4 text-xs text-gray-600">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={!!e.soon} onChange={(ev) => patch(i, { soon: ev.target.checked || undefined })} /> Coming soon badge
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={!!e.unconfirmed} onChange={(ev) => patch(i, { unconfirmed: ev.target.checked || undefined })} /> Date unconfirmed
            </label>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...list, { date: "", set: "", game: "", notes: "" }])}>
        <Plus size={14} className="mr-1" /> Add release
      </Button>
    </div>
  );
}

/* ─────────── Blog posts editor ─────────── */

interface AdminBlogListItem {
  slug: string;
  title: string;
  hasDraft: boolean;
  hasPublished: boolean;
  updatedAt: string | null;
}

interface BlogVersion {
  id: number;
  published_at: string;
}

export function PostsEditor() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminBlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [hasPublished, setHasPublished] = useState(false);
  const [versions, setVersions] = useState<BlogVersion[]>([]);
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data?.posts)) setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadPost = useCallback(async (s: string) => {
    if (!s) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(s)}`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.post) {
        setPost(data.post as BlogPostData);
        setHasPublished(!!data.published);
        setVersions(Array.isArray(data.versions) ? data.versions : []);
      } else {
        toast({ title: "Could not load post", description: data?.error || s, variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const doImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/blog/import", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast({ title: "Import complete", description: `${data.imported} posts are now editable here` });
        await loadList();
      } else {
        toast({ title: "Import failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } finally {
      setImporting(false);
    }
  };

  const saveDraft = async () => {
    if (!post) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(post.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast({ title: "Draft saved", description: "Publish the post to make this version live" });
        await loadList();
      } else {
        toast({ title: "Save failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  };

  const publishPost = async () => {
    if (!post) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/blog/${encodeURIComponent(post.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(post.slug)}/publish`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast({ title: "Post published", description: "This version is now live on the blog" });
        setHasPublished(true);
        await loadPost(post.slug);
        await loadList();
      } else {
        toast({ title: "Publish failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  };

  const rollbackPost = async (versionId: number) => {
    if (!post) return;
    if (!window.confirm("Restore this earlier published version? It becomes the live post and your current draft.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(post.slug)}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast({ title: "Version restored", description: "The restored version is live" });
        await loadPost(post.slug);
        await loadList();
      } else {
        toast({ title: "Restore failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  };

  const patchSection = (i: number, p: Partial<BlogSectionData>) =>
    post && setPost({ ...post, sections: post.sections.map((s, j) => (j === i ? { ...s, ...p } : s)) });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Blog Posts</h2>
        <p className="text-sm text-gray-500">
          Edit any article, save a draft, then publish it live — no rebuild needed. Posts that were never edited here keep serving the built-in version.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Select
                value={slug}
                onValueChange={(v) => {
                  setSlug(v);
                  loadPost(v);
                }}
              >
                <SelectTrigger><SelectValue placeholder={loading ? "Loading posts…" : "Choose a post to edit"} /></SelectTrigger>
                <SelectContent>
                  {posts.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {p.title} {p.hasDraft ? "(draft edits)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={doImport} disabled={importing}>
              {importing ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <FileText size={14} className="mr-1.5" />}
              Import built-in posts
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            {posts.length} posts known. “Import built-in posts” copies the site&apos;s built-in articles into the editor (safe to run again — it never overwrites your edits).
          </p>

          {post && (
            <div className="space-y-5 pt-2 border-t">
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 border ${hasPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {hasPublished ? "Edited version is live" : "Built-in version is live"}
                </span>
                <span className="text-gray-400 font-mono">/blog/{post.slug}</span>
              </div>
              <TextField label="Browser tab title (meta title)" value={post.metaTitle} onChange={(v) => setPost({ ...post, metaTitle: v })} />
              <AreaField label="Meta description" rows={2} value={post.metaDescription} onChange={(v) => setPost({ ...post, metaDescription: v })} />
              <TextField label="Page heading (H1)" value={post.h1} onChange={(v) => setPost({ ...post, h1: v })} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Date published (YYYY-MM-DD)" value={post.datePublished} onChange={(v) => setPost({ ...post, datePublished: v })} />
                <NumberField label="Read minutes" value={post.readMinutes} onChange={(v) => setPost({ ...post, readMinutes: v })} />
              </div>
              <StrListEditor label="Intro paragraphs" itemLabel="Paragraph" textarea value={post.intro} onChange={(v) => setPost({ ...post, intro: v })} />
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-600">Article sections</Label>
                {post.sections.map((s, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-3 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <Input value={s.h} onChange={(e) => patchSection(i, { h: e.target.value })} placeholder="Section heading" className="flex-1 bg-white font-medium" />
                      <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => setPost({ ...post, sections: post.sections.filter((_, j) => j !== i) })} aria-label="Delete section"><Trash2 size={14} /></Button>
                    </div>
                    <StrListEditor label="Paragraphs" itemLabel="Paragraph" textarea value={s.paragraphs} onChange={(v) => patchSection(i, { paragraphs: v })} />
                    <AreaField label="Note (optional callout)" value={s.note ?? ""} onChange={(v) => patchSection(i, { note: v || undefined })} />
                    <StrListEditor label="Checklist (optional)" itemLabel="Item" value={s.checklist ?? []} onChange={(v) => patchSection(i, { checklist: v.length ? v : undefined })} />
                    <StrListEditor label="Exposed math lines (optional)" itemLabel="Line" value={s.math ?? []} onChange={(v) => patchSection(i, { math: v.length ? v : undefined })} />
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">Table (optional) — one row per line, cells separated by |</Label>
                      <Input
                        value={(s.table?.head ?? []).join(" | ")}
                        onChange={(e) => {
                          patchSection(i, { table: e.target.value.trim() ? { head: e.target.value.split("|").map((x) => x.trim()), rows: s.table?.rows ?? [] } : undefined });
                        }}
                        placeholder="Header 1 | Header 2 | Header 3"
                        className="bg-white"
                      />
                      <Textarea
                        value={(s.table?.rows ?? []).map((r) => r.join(" | ")).join("\n")}
                        onChange={(e) => {
                          const rows = e.target.value.split("\n").filter((l) => l.trim()).map((l) => l.split("|").map((x) => x.trim()));
                          patchSection(i, { table: s.table ? { head: s.table.head, rows } : undefined });
                        }}
                        rows={3}
                        className="min-h-0 bg-white"
                        placeholder={"Row 1 cell | Row 1 cell\nRow 2 cell | Row 2 cell"}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setPost({ ...post, sections: [...post.sections, { h: "", paragraphs: [""] }] })}>
                  <Plus size={14} className="mr-1" /> Add section
                </Button>
              </div>
              <StrListEditor label="Takeaway bullets" itemLabel="Bullet" textarea value={post.takeaway} onChange={(v) => setPost({ ...post, takeaway: v })} />
              <FaqEditor value={post.faqs} onChange={(v) => setPost({ ...post, faqs: v })} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" variant="outline" onClick={saveDraft} disabled={busy}>
                  Save draft
                </Button>
                <Button type="button" onClick={publishPost} disabled={busy} className="bg-purple-950 hover:bg-purple-800">
                  Publish this post
                </Button>
              </div>
              {versions.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-medium text-gray-600">Earlier published versions (restore)</Label>
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-2 text-sm border rounded-lg px-3 py-2">
                      <span className="flex items-center gap-2 text-gray-600">
                        <History size={14} /> {new Date(v.published_at).toLocaleString()}
                      </span>
                      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => rollbackPost(v.id)}>
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────── Publications (restore last 3) ─────────── */

interface PublicationRow {
  id: number;
  published_at: string;
  note: string | null;
  productCount: number;
}

export function PublicationsCard() {
  const { toast } = useToast();
  const [pubs, setPubs] = useState<PublicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publications");
      const data = await res.json().catch(() => null);
      if (res.ok && Array.isArray(data?.publications)) setPubs(data.publications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const restore = async (id: number) => {
    if (!window.confirm("Restore this publication? The live store (products + all page content) goes back to exactly this version, and your current draft is reset to it.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicationId: id }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        toast({ title: "Publication restored", description: "The live store now shows the restored version" });
        await adminStore.refreshBaseline();
        await load();
      } else {
        toast({ title: "Restore failed", description: data?.error || "Unknown error", variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History size={18} className="text-purple-950" />
          <CardTitle className="text-base">Publications</CardTitle>
        </div>
        <CardDescription>
          Every Publish saves a snapshot of the whole store. The last 3 are kept — restore any of them to roll the live store back.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading publications…</p>
        ) : pubs.length === 0 ? (
          <p className="text-sm text-gray-500">No publications yet. The first time you press Publish, a snapshot is saved here.</p>
        ) : (
          <div className="space-y-2">
            {pubs.map((p, i) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-lg px-3 py-2.5">
                <div className="text-sm">
                  <span className="font-medium text-gray-800">{new Date(p.published_at).toLocaleString()}</span>
                  {i === 0 && <span className="ml-2 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">LIVE NOW</span>}
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {p.productCount} products{p.note ? ` · ${p.note}` : ""}
                  </span>
                </div>
                {i !== 0 && (
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => restore(p.id)}>
                    Restore this version
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────── Payment methods editor (Settings) ─────────── */

export function PaymentMethodsEditor() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);

  useEffect(() => {
    let on = true;
    adminStore.ready().then(() => {
      if (!on) return;
      const full = adminStore.getFullContent();
      if (!full) return;
      setMethods(JSON.parse(JSON.stringify(full.settings.paymentMethods ?? [])) as PaymentMethod[]);
    });
    return () => {
      on = false;
    };
  }, []);

  if (!methods) return <p className="text-sm text-gray-500">Loading payment methods…</p>;

  const save = (next: PaymentMethod[]) => {
    setMethods(next);
    const full = adminStore.getFullContent();
    if (!full) return;
    const settings: SiteSettings = { ...full.settings, paymentMethods: next };
    adminStore.setContentKey("settings", settings);
  };

  const patch = (i: number, p: Partial<PaymentMethod>) =>
    save(methods.map((m, j) => (j === i ? { ...m, ...p } : m)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= methods.length) return;
    const next = [...methods];
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium">Payment Methods (checkout)</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Shown as the payment options at checkout, in this order. Changes save to your draft as you type — Publish to go live.
        </p>
      </div>
      {methods.map((m, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Input value={m.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="Method name, e.g. Wise" className="flex-1 bg-white font-medium" />
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={14} /></Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={14} /></Button>
            <Button type="button" variant="ghost" size="icon" className="size-8 text-red-500" onClick={() => save(methods.filter((_, j) => j !== i))} aria-label="Delete method"><Trash2 size={14} /></Button>
          </div>
          <Textarea value={m.instructions} onChange={(e) => patch(i, { instructions: e.target.value })} placeholder="Instructions shown after the customer picks this method" rows={2} className="min-h-0 bg-white" />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          save([...methods, { id: `method-${Date.now().toString(36)}`, label: "", instructions: "" }]);
          toast({ title: "Method added", description: "Name it and add its instructions" });
        }}
      >
        <Plus size={14} className="mr-1" /> Add payment method
      </Button>
    </div>
  );
}
