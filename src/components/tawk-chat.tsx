"use client";

import { useEffect } from "react";

/**
 * Tawk.to live chat — loaded globally from the root layout so the widget is
 * available on EVERY page (storefront, product pages, category pages).
 *
 * Loading strategy:
 *  - The <script> is async + non-blocking: it never delays page render.
 *  - Preconnect hints for tawk.to domains are emitted in <head> (layout.tsx),
 *    so the DNS/TLS handshake overlaps with page load instead of starting
 *    after it — the widget appears as early as physically possible.
 *  - Guarded against double injection (idempotent across client navigations).
 */
const TAWK_WIDGET_ID = "6a37ce08b40d591d46abba12/1jrkvpkov";

export default function TawkChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("tawk-script")) return;

    // Define Tawk_API before the script loads — required for callbacks and
    // for programmatic control (maximize / setAttributes) from checkout.
    const w = window as typeof window & {
      Tawk_API?: {
        onLoad?: () => void;
        onChatBegin?: () => void;
        maximize?: () => void;
        setAttributes?: (
          attrs: Record<string, string>,
          cb?: (error: unknown) => void
        ) => void;
        [key: string]: unknown;
      };
    };

    w.Tawk_API = w.Tawk_API || {};
    // onLoad ensures the visitor is tracked and notifications are triggered
    w.Tawk_API.onLoad = () => {
      // Visitor tracking active — widget ready
    };

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = `https://embed.tawk.to/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);
  }, []);

  return null;
}
