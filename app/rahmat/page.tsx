import type { Metadata } from "next";
import Image from "next/image";
import Icon from "@/components/Icons";
import { formatPhone, instagramLink, phoneHref, site, telegramLink } from "@/lib/site";

export const metadata: Metadata = { title: "Rahmat! Arizangiz qabul qilindi", robots: { index: false } };

export default async function Rahmat({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name = "" } = await searchParams;
  const first = name.replace(/[<>]/g, "").slice(0, 30);

  return (
    <main className="thanks">
      <div className="thanks-card">
        <Image src="/logo.png" alt="DIYOR" width={154} height={32} priority />
        <div className="check-badge">
          <Icon name="check" size={44} />
        </div>
        <h1>Rahmat{first ? `, ${first}` : ""}! Arizangiz qabul qilindi</h1>
        <p>
          Mutaxassisimiz ish vaqtida <b>15 daqiqa ichida</b> qo&apos;ng&apos;iroq qiladi. Telefoningizni yaqin tuting 📞
        </p>
        <p style={{ fontSize: 14, opacity: 0.75 }}>{site.hours}</p>
        <div className="thanks-actions">
          <a className="btn btn-cta btn-lg btn-block" href={phoneHref()}>
            <Icon name="phone" size={20} /> Kutmasdan qo&apos;ng&apos;iroq qilish
          </a>
          {telegramLink && (
            <a className="btn btn-ghost btn-lg btn-block" href={telegramLink} target="_blank" rel="noopener noreferrer">
              Telegramda yozish
            </a>
          )}
          <a className="btn btn-ghost btn-lg btn-block" href={instagramLink} target="_blank" rel="noopener noreferrer">
            <Icon name="insta" size={20} /> Instagramdagi ishlarimiz
          </a>
          <a href="/" style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>
            ← Bosh sahifa · {formatPhone(site.phone)}
          </a>
        </div>
      </div>
    </main>
  );
}
