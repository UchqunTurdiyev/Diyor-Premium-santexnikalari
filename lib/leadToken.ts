// "Sotib oldi" tugmasidagi link uchun token.
// - Telefon, ism, external_id Meta talabi bo'yicha SHA-256 bilan HESHLANADI (buildUserData).
// - Butun paket (heshlar + fbp/fbc/IP/UA + lid ID + Telegram xabar ID) zlib bilan siqilib,
//   AES-256-GCM bilan SHIFRLANADI. Kalitsiz linkni o'qib ham, o'zgartirib ham bo'lmaydi.
import crypto from "crypto";
import zlib from "zlib";
import type { NextRequest } from "next/server";
import { buildUserData, type MetaUser } from "./meta";

export type LeadToken = {
  v: 1;
  lid: string; // lid event_id
  t: number; // lid vaqti (unix soniya)
  url?: string; // event_source_url
  ud: Record<string, unknown>; // Meta uchun tayyor heshlangan user_data
  label: string; // sotuv sahifasida: "Dilnoza · ••67"
  interest?: string;
  p?: string; // telefon raqami (token shifrlangan) — Telegram "Qo'ng'iroq" tugmasini tiklash uchun
  q?: 1; // lid "sifatli" deb belgilangan (QualifiedLead yuborilgan)
  n?: number; // shu paytgacha nechta xarid qilingan (LTV)
  ltv?: number; // shu paytgacha jami to'langan summa
  // c = chat_id, m = tugma turgan xabar, r = asl lid xabari (javoblar unga bog'lanadi)
  tg?: { c: string; m: number; r?: number };
};

// Kalit: LEAD_TOKEN_SECRET (ixtiyoriy). Bo'lmasa — serverdagi maxfiy tokenlardan avtomatik.
function key() {
  const secret =
    process.env.LEAD_TOKEN_SECRET ||
    [process.env.TELEGRAM_BOT_TOKEN, process.env.META_CAPI_ACCESS_TOKEN].filter(Boolean).join("|");
  if (!secret || secret.length < 32) throw new Error("Shifrlash kaliti yo'q: TELEGRAM_BOT_TOKEN sozlang");
  return crypto.createHash("sha256").update("lead-token-v1|" + secret).digest();
}

export function encodeLeadToken(p: LeadToken): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(zlib.deflateRawSync(Buffer.from(JSON.stringify(p)))), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function decodeLeadToken(token: string): LeadToken {
  const buf = Buffer.from(String(token || ""), "base64url");
  if (buf.length < 29) throw new Error("Link noto'g'ri");
  let p: LeadToken;
  try {
    const d = crypto.createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const packed = Buffer.concat([d.update(buf.subarray(28)), d.final()]);
    p = JSON.parse(zlib.inflateRawSync(packed).toString("utf8"));
  } catch {
    throw new Error("Link buzilgan yoki soxta");
  }
  if (p.v !== 1) throw new Error("Link versiyasi mos emas");
  // Qayta sotuvlar (LTV) oylar o'tib bo'lishi mumkin — standart muddat 1 yil.
  const ttl = Number(process.env.LEAD_TOKEN_TTL_DAYS || 365);
  if (Date.now() / 1000 - p.t > ttl * 86400) throw new Error(`Link muddati tugagan (${ttl} kun)`);
  return p;
}

export function makeLeadToken(opts: {
  id: string;
  t: number;
  url?: string;
  user: MetaUser;
  name: string;
  phone: string;
  interest?: string;
  q?: boolean;
  tg?: { c: string; m: number; r?: number };
}) {
  const digits = opts.phone.replace(/\D/g, "");
  return encodeLeadToken({
    v: 1,
    lid: opts.id,
    t: opts.t,
    url: opts.url,
    ud: buildUserData(opts.user),
    label: `${opts.name.trim().split(/\s+/)[0]} · ••${digits.slice(-2)}`,
    interest: opts.interest,
    p: digits,
    q: opts.q ? 1 : undefined,
    n: 0,
    ltv: 0,
    tg: opts.tg,
  });
}

// Saytning ochiq manzili: NEXT_PUBLIC_SITE_URL, bo'lmasa so'rov kelgan domen (Vercel'da https)
export function baseUrl(req?: NextRequest) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env && !/localhost|127\.0\.0\.1/.test(env)) return env.replace(/\/$/, "");
  const host = req?.headers.get("x-forwarded-host") || req?.headers.get("host");
  if (host) return `${req?.headers.get("x-forwarded-proto") || "https"}://${host}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return (env || "http://localhost:3000").replace(/\/$/, "");
}
