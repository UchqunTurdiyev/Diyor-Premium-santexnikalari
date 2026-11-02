import type { Metadata } from "next";
import { decodeLeadToken } from "@/lib/leadToken";
import PurchaseForm from "./PurchaseForm";
import "./sotuv.css";

export const metadata: Metadata = { title: "Sotuvni tasdiqlash", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Telegramdagi "💰 Sotib oldi" / "🔁 Qayta sotib oldi" tugmalari shu sahifani ochadi.
export default async function SotuvPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;

  let lead: ReturnType<typeof decodeLeadToken> | null = null;
  let error = "";
  try {
    lead = decodeLeadToken(t);
  } catch (e) {
    error = e instanceof Error ? e.message : "Link noto'g'ri";
  }

  if (!lead) {
    return (
      <main className="sale">
        <div className="sale-card">
          <h1>⚠️ Link ishlamaydi</h1>
          <p className="sale-muted">{error}</p>
        </div>
      </main>
    );
  }

  const ud = lead.ud as Record<string, unknown>;
  const date = new Date(lead.t * 1000).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const currency = process.env.META_CURRENCY || "UZS";
  const n = lead.n || 0;
  const signals = [
    { k: "Telefon (hesh)", ok: !!ud.ph },
    { k: "Ism (hesh)", ok: !!ud.fn },
    { k: "external_id (hesh)", ok: !!ud.external_id },
    { k: "_fbc (reklama kliki)", ok: !!ud.fbc },
    { k: "_fbp (pixel cookie)", ok: !!ud.fbp },
    { k: "IP + brauzer", ok: !!ud.client_ip_address && !!ud.client_user_agent },
  ];

  return (
    <main className="sale">
      <div className="sale-card">
        <span className="sale-tag">🚿 DIYOR · {n > 0 ? `qayta xarid #${n + 1}` : "birinchi xarid"}</span>
        <h1>{lead.label}</h1>
        <p className="sale-muted">
          Lid: {date}
          {lead.interest ? ` · ${lead.interest}` : ""}
        </p>

        {n > 0 && (
          <div className="sale-ltv">
            <span>Hozirgi LTV</span>
            <b>
              {fmt(lead.ltv || 0)} {currency}
            </b>
            <small>{n} ta xarid</small>
          </div>
        )}

        <div className="sale-signals">
          <p>Metaga ketadigan ma&apos;lumotlar (shifrlangan link ichida):</p>
          <ul>
            {signals.map((s) => (
              <li key={s.k} className={s.ok ? "ok" : "no"}>
                {s.ok ? "✓" : "—"} {s.k}
              </li>
            ))}
          </ul>
        </div>

        <PurchaseForm
          token={t}
          defaultValue={Number(process.env.META_PURCHASE_VALUE || 0) || undefined}
          currency={currency}
          pinRequired={!!process.env.SALES_PIN}
        />
      </div>
    </main>
  );
}
