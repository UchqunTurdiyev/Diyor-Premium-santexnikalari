import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev rejimidagi "N" belgisi telefonda pastki tugmalar ustiga tushmasin.
  devIndicators: false,
  // Tekshiruv buildlari `NEXT_DIST_DIR=.next-check` bilan alohida papkaga yoziladi,
  // shunda ishlab turgan `next dev` ning `.next` papkasi buzilmaydi.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Telefondan lokal tarmoq orqali (192.168.x.x:3000) ochilganda dev server bloklamasin.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
