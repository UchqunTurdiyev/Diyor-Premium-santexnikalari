"use client";

import { useEffect } from "react";
import { track } from "./MetaPixel";

// Yengil animatsiya dvigateli (kutubxonasiz):
//  • [data-reveal] — ekranga kirganda silliq paydo bo'ladi
//  • [data-count]  — raqamlar 0 dan sanab chiqadi
//  • a[href^="tel:"] bosilsa — Meta "Contact" hodisasi
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>("[data-reveal],[data-count]");

    const count = (el: HTMLElement) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + suffix;
      if (reduce) return void (el.textContent = fmt(target));
      const t0 = performance.now();
      const dur = 1400;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("in");
          if (el.dataset.count) count(el);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("Contact", { content_name: "Telefon" });
      else if (href.includes("instagram.com") || href.includes("t.me/"))
        track("Contact", { content_name: href.includes("t.me/") ? "Telegram" : "Instagram" });
    };
    document.addEventListener("click", onClick);

    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
