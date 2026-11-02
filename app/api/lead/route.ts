import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sendMetaEvent } from "@/lib/meta";
import { buildLeadMessage, chatIds, leadKeyboard, tg, type LeadMeta } from "@/lib/telegram";
import { formatPhone, interests } from "@/lib/site";
import { baseUrl, makeLeadToken } from "@/lib/leadToken";

export const runtime = "nodejs";

// Qatorlarni bitta qatorga yig'amiz — Telegram xabaridagi maydonlarni buzib bo'lmasin.
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  // Bot himoyasi: yashirin maydon to'ldirilgan bo'lsa — jim muvaffaqiyat.
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 80);
  const digits = clean(body.phone, 30).replace(/\D/g, "");
  const phone = digits.length === 9 ? `998${digits}` : digits;
  const rawInterest = clean(body.interest, 60);
  const interest = (interests as readonly string[]).includes(rawInterest) ? rawInterest : "";

  if (name.length < 2) return NextResponse.json({ ok: false, error: "Ismingizni kiriting" }, { status: 400 });
  if (!/^998\d{9}$/.test(phone))
    return NextResponse.json({ ok: false, error: "Telefon raqamni to'liq kiriting" }, { status: 400 });

  const eventId = clean(body.eventId, 64) || `lead_${randomUUID()}`;
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";

  const lead: LeadMeta = {
    id: eventId,
    name,
    phone: `+${phone}`,
    interest,
    t: Math.floor(Date.now() / 1000),
    url: clean(body.url, 300) || baseUrl(req),
    src: clean(body.src, 120),
    ip,
    ua: (req.headers.get("user-agent") || "").slice(0, 300),
    fbp: clean(body.fbp, 120),
    fbc: clean(body.fbc, 300),
  };

  const ids = chatIds();
  if (!process.env.TELEGRAM_BOT_TOKEN || ids.length === 0) {
    console.error("[lead] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan", { ...lead, phone: formatPhone(phone) });
    return NextResponse.json({ ok: false, error: "Server sozlanmagan" }, { status: 500 });
  }

  const text = buildLeadMessage({ ...lead, phone: formatPhone(phone) });
  const siteUrl = baseUrl(req);
  const metaUser = { phone, name, externalId: phone, ip, userAgent: lead.ua, fbp: lead.fbp, fbc: lead.fbc };

  // Har bir chatga: xabar → keyin "Sotib oldi" tugmasi (ichida shu xabar ID'si bilan shifrlangan link)
  const sendToChat = async (chat_id: string) => {
    const msg = await tg<{ message_id: number; chat: { id: number } }>("sendMessage", {
      chat_id,
      text,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: leadKeyboard({ siteUrl, phone }),
    });
    try {
      const token = makeLeadToken({
        id: lead.id,
        t: lead.t,
        url: lead.url,
        user: metaUser,
        name,
        phone,
        interest,
        tg: { c: String(msg.chat.id), m: msg.message_id, r: msg.message_id },
      });
      await tg("editMessageReplyMarkup", {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: leadKeyboard({ siteUrl, phone, purchaseUrl: `${siteUrl}/sotuv?t=${token}` }),
      });
    } catch (e) {
      console.error("[lead] sotib oldi tugmasi", e);
    }
    return msg;
  };

  const [tgResults, meta] = await Promise.all([
    Promise.allSettled(ids.map(sendToChat)),
    // Brauzerdagi Pixel bilan bir xil eventId — Meta ikkalasini bitta hodisa deb hisoblaydi.
    sendMetaEvent({
      eventName: "Lead",
      eventId,
      eventTime: lead.t,
      sourceUrl: lead.url,
      user: metaUser,
      customData: { content_name: "Bepul maslahat", content_category: interest || "Santexnika" },
    }),
  ]);

  const delivered = tgResults.some((r) => r.status === "fulfilled");
  tgResults.forEach((r) => r.status === "rejected" && console.error("[lead] telegram", r.reason));
  if (!meta.ok) console.warn("[lead] meta", meta.error);

  if (!delivered)
    return NextResponse.json({ ok: false, error: "Yuborib bo'lmadi, qayta urinib ko'ring" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
