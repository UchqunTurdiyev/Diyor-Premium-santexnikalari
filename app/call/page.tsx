import type { Metadata } from "next";
import { formatPhone } from "@/lib/site";
import AutoDial from "./AutoDial";

export const metadata: Metadata = { title: "Qo'ng'iroq qilish", robots: { index: false } };

// Telegram botdagi "📞 Qo'ng'iroq qilish" tugmasi shu sahifani ochadi va darhol raqam teriladi.
export default async function CallPage({ searchParams }: { searchParams: Promise<{ n?: string }> }) {
  const { n = "" } = await searchParams;
  const digits = n.replace(/\D/g, "").slice(0, 15);
  const href = `tel:+${digits}`;

  return (
    <main className="thanks">
      <div className="thanks-card">
        <p>Mijozga qo&apos;ng&apos;iroq</p>
        <h1>{digits ? formatPhone(digits) : "Raqam topilmadi"}</h1>
        {digits && (
          <>
            <a className="btn btn-cta btn-lg" href={href}>
              Qo&apos;ng&apos;iroq qilish
            </a>
            <AutoDial href={href} />
          </>
        )}
      </div>
    </main>
  );
}
