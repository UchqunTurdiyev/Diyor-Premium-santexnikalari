import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import Motion from "@/components/Motion";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "DIYOR — premium santexnika ishlab chiqaruvchi narxida | 10 yilgacha kafolat",
  description:
    "GROHE, Hansgrohe, Geberit, VitrA — rasmiy distribyutordan. Vositachilarsiz eng yaxshi narx, 10 yilgacha kafolat, Toshkentda 1–2 kunda yetkazib berish. Bepul maslahat oling.",
  openGraph: {
    title: "DIYOR — premium santexnika ishlab chiqaruvchi narxida",
    description: "10 yilgacha rasmiy kafolat. Vositachilarsiz eng yaxshi narx. Bepul maslahat.",
    type: "website",
    locale: "uz_UZ",
    images: ["/og.jpg"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#2f2e63", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={sans.variable}>
      <body>
        {children}
        <Motion />
        <MetaPixel />
      </body>
    </html>
  );
}
