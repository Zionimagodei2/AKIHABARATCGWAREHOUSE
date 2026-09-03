"use client";

import { useEffect } from "react";

/**
 * Tawk.to live chat — loaded globally from the root layout so the widget is
 * available on EVERY page (storefront, product pages, category pages).
 *
 * Reliability strategy (fixes intermittent missing widget / missed visitor
 * notifications):
 *  - The <script> is async + non-blocking: it never delays page render.
 *  - Injection happens when the browser is idle (requestIdleCallback with a
 *    load-event fallback) so the embed never competes with hydration, images
 *    or LCP — but it ALWAYS boots, even on slow connections.
 *  - If the script request FAILS (network hiccup, CDN drop, ad-blocker race)
 *    it is retried with exponential backoff (up to 3 attempts, cache-busted),
 *    because a silent failure = no widget = no visitor notifications.
 *  - A 15s watchdog re-injects if the script never settled.
 *  - No crossorigin attribute: the standard Tawk embed is a classic script;
 *    forcing CORS mode ("crossorigin=*") can make CDNs/proxies fail it.
 *  - Preconnect hints for tawk.to domains are emitted in <head> (layout.tsx)
 *    so the DNS/TLS handshake overlaps with page load.
 *  - Guarded against double injection (idempotent across client navigations).
 *
 * window.Tawk_API is defined BEFORE the script loads — required for callbacks
 * and for programmatic control (maximize / setAttributes) from checkout.
 */
const TAWK_WIDGET_ID = "6a37ce08b40d591d46abba12/1jrkvpkov";
const MAX_ATTEMPTS = 3;

type TawkAPI = {
  onLoad?: () => void;
  onChatBegin?: () => void;
  maximize?: () => void;
  setAttributes?: (attrs: Record<string, string>, cb?: (error: unknown) => void) => void;
  [key: string]: unknown;
};

export default function TawkChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as typeof window & {
      Tawk_API?: TawkAPI;
      __tawkBooted?: boolean;
    };

    w.Tawk_API = w.Tawk_API || {};
    w.Tawk_API.onLoad = () => {
      // Visitor tracking active — widget ready, notifications will fire.
    };

    // Idempotency guard: only one injection pipeline per browser session.
    if (w.__tawkBooted) return;
    w.__tawkBooted = true;

    let settled = false;
    let attempts = 0;

    const inject = () => {
      if (settled || attempts >= MAX_ATTEMPTS) return;
      attempts++;
      const s = document.createElement("script");
      s.id = "tawk-script";
      s.async = true;
      // Cache-bust retries so a cached error response can't poison the retry.
      s.src =
        attempts === 1
          ? `https://embed.tawk.to/${TAWK_WIDGET_ID}`
          : `https://embed.tawk.to/${TAWK_WIDGET_ID}?_=${Date.now()}`;
      s.charset = "UTF-8";
      s.onload = () => {
        settled = true;
      };
      s.onerror = () => {
        // Script failed to fetch/execute — remove and retry with backoff.
        s.remove();
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(inject, 1500 * attempts);
        }
      };
      document.head.appendChild(s);
    };

    // Load once the page is done painting — never blocks render.
    const start = () => {
      const ric = (window as typeof window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }).requestIdleCallback;
      if (typeof ric === "function") {
        ric(inject, { timeout: 2500 });
      } else {
        setTimeout(inject, 300);
      }
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    // Watchdog: if nothing settled after 15s (silent stall), re-inject.
    const watchdog = window.setTimeout(() => {
      if (!settled) inject();
    }, 15000);

    return () => window.clearTimeout(watchdog);
  }, []);

  return null;
}
