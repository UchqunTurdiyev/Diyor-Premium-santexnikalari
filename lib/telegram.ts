// Telegram Bot API yordamchilari (server tomoni).

const api = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export async function tg<T = unknown>(method: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(api(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description}`);
  return json.result as T;
}

export const chatIds = () =>
  (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const fmtMoney = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const isPublicUrl = (u: string) => /^https:\/\//.test(u) && !/localhost|127\.0\.0\.1/.test(u);

// Lid haqidagi texnik ma'lumotlar xabar ichida yig'ma (expandable) blokda saqlanadi.
// "Sifatli lid" tugmasi bosilganda Meta hodisasi aynan shu ma'lumotlardan yig'iladi —
// ma'lumotlar bazasi kerak emas.
export type LeadMeta = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  t: number;
  url?: string;
  src?: string; // utm_source/utm_campaign — qaysi reklamadan kelgani
  ip?: string;
  ua?: string;
  fbp?: string;
  fbc?: string;
};

const META_KEYS = ["id", "t", "src", "url", "ip", "fbp", "fbc", "ua"] as const;

export function buildLeadMessage(l: LeadMeta) {
  const date = new Date(l.t * 1000).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const tech = META_KEYS.filter((k) => l[k] !== undefined && l[k] !== "")
    .map((k) => `${k}: ${escapeHtml(String(l[k]))}`)
    .join("\n");

  return [
    `🚿 <b>Yangi lid — DIYOR santexnika</b>`,
    ``,
    `👤 Ism: <b>${escapeHtml(l.name)}</b>`,
    `📞 Raqam: ${escapeHtml(l.phone)}`,
    `🛁 Qiziqish: ${escapeHtml(l.interest || "—")}`,
    `🕒 ${date}`,
    ``,
    `<blockquote expandable>${tech}</blockquote>`,
  ].join("\n");
}

// Xabar matnidan (callback_query.message.text) lid ma'lumotlarini qayta o'qish.
export function parseLeadMessage(text: string): LeadMeta | null {
  const line = (re: RegExp) => text.match(re)?.[1]?.trim() ?? "";
  const meta: Record<string, string> = {};
  for (const k of META_KEYS) {
    const m = text.match(new RegExp(`^${k}: (.*)$`, "m"));
    if (m) meta[k] = m[1].trim();
  }
  if (!meta.id) return null;
  return {
    id: meta.id,
    t: Number(meta.t) || Math.floor(Date.now() / 1000),
    url: meta.url,
    src: meta.src,
    ip: meta.ip,
    ua: meta.ua,
    fbp: meta.fbp,
    fbc: meta.fbc,
    name: line(/^👤 Ism: (.*)$/m),
    phone: line(/^📞 Raqam: (.*)$/m),
    interest: line(/^🛁 Qiziqish: (.*)$/m),
  };
}

type Btn = { text: string; url?: string; callback_data?: string };
export type Keyboard = { inline_keyboard: Btn[][] };

// Lid xabari tugmalari:
//  📞 Qo'ng'iroq qilish            (url → /call, raqam darhol teriladi)
//  ⭐ Sifatli lid | 🚫 Sifatsiz      (callback → webhook → Meta "QualifiedLead")
//  💰 Sotib oldi → summa kiritish   (url → /sotuv, Meta "Purchase" + LTV)
export function leadKeyboard(opts: {
  siteUrl: string;
  phone: string;
  quality?: "q" | "x"; // allaqachon belgilangan bo'lsa
  purchaseUrl?: string;
}): Keyboard {
  const digits = opts.phone.replace(/\D/g, "");
  const rows: Btn[][] = [];
  // Telegram inline tugmalarida tel: ishlamaydi va localhost havolalarini qabul qilmaydi.
  if (isPublicUrl(opts.siteUrl) && digits)
    rows.push([{ text: "📞 Qo'ng'iroq qilish", url: `${opts.siteUrl.replace(/\/$/, "")}/call?n=${digits}` }]);
  rows.push(qualityRow(opts.quality));
  if (opts.purchaseUrl && isPublicUrl(opts.purchaseUrl))
    rows.push([{ text: "💰 Sotib oldi → summa kiritish", url: opts.purchaseUrl }]);
  return { inline_keyboard: rows };
}

export function qualityRow(quality?: "q" | "x"): Btn[] {
  if (quality === "q") return [{ text: "✅ Sifatli lid — Metaga yuborildi", callback_data: "noop" }];
  if (quality === "x") return [{ text: "🚫 Sifatsiz deb belgilandi", callback_data: "noop" }];
  return [
    { text: "⭐ Sifatli lid", callback_data: "q" },
    { text: "🚫 Sifatsiz", callback_data: "x" },
  ];
}

// Mavjud klaviaturada faqat sifat qatorini almashtiramiz — boshqa tugmalar (sotuv linki) saqlanadi.
export function withQuality(kb: Keyboard | undefined, quality: "q" | "x"): Keyboard {
  const rows = (kb?.inline_keyboard ?? []).map((row) =>
    row.some((b) => b.callback_data === "q" || b.callback_data === "x" || b.callback_data === "noop")
      ? qualityRow(quality)
      : row,
  );
  return { inline_keyboard: rows };
}

// Sotuvdan keyin: "Sotib oldi" tugmasini olib tashlaymiz (u endi LTV javob xabarida yashaydi).
export function withoutPurchase(kb: Keyboard | undefined): Keyboard {
  return { inline_keyboard: (kb?.inline_keyboard ?? []).filter((row) => !row.some((b) => b.url?.includes("/sotuv?"))) };
}
