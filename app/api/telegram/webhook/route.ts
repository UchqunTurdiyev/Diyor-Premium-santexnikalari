import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta";
import { chatIds, parseLeadMessage, tg, withQuality, type Keyboard } from "@/lib/telegram";
import { baseUrl, makeLeadToken } from "@/lib/leadToken";

export const runtime = "nodejs";

type CallbackQuery = {
  id: string;
  data?: string;
  from: { id: number; first_name?: string; username?: string };
  message?: { message_id: number; chat: { id: number }; text?: string; reply_markup?: Keyboard };
};

const answer = (id: string, text: string, show_alert = false) =>
  tg("answerCallbackQuery", { callback_query_id: id, text, show_alert }).catch(() => {});

// "⭐ Sifatli lid" / "🚫 Sifatsiz" tugmalari shu yerga keladi.
export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const cq: CallbackQuery | undefined = update?.callback_query;
  if (!cq?.message) return NextResponse.json({ ok: true });
  const msg = cq.message;

  // Faqat lid tushadigan chatlardagi tugmalar ishlaydi.
  if (!chatIds().includes(String(msg.chat.id))) {
    await answer(cq.id, "Ruxsat yo'q");
    return NextResponse.json({ ok: true });
  }

  if (cq.data === "noop") {
    await answer(cq.id, "Bu lid allaqachon belgilangan ✅");
    return NextResponse.json({ ok: true });
  }
  if (cq.data !== "q" && cq.data !== "x") return NextResponse.json({ ok: true });

  const lead = parseLeadMessage(msg.text || "");
  if (!lead) {
    await answer(cq.id, "Lid ma'lumotlarini o'qib bo'lmadi", true);
    return NextResponse.json({ ok: true });
  }

  const who = cq.from.first_name || cq.from.username || "menejer";

  if (cq.data === "x") {
    await tg("editMessageReplyMarkup", {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      reply_markup: withQuality(msg.reply_markup, "x"),
    }).catch((e) => console.error("[webhook]", e));
    await answer(cq.id, `🚫 Sifatsiz deb belgilandi (${who})`);
    return NextResponse.json({ ok: true });
  }

  // ⭐ Sifatli lid → Meta CAPI "QualifiedLead" (maxsus hodisa).
  // Reklamani "sifatli lid"ga optimizatsiya qilish uchun Events Manager'da shu hodisadan
  // Custom Conversion yarating.
  const phone = lead.phone.replace(/\D/g, "");
  const user = {
    phone,
    name: lead.name,
    externalId: phone,
    ip: lead.ip,
    userAgent: lead.ua,
    fbp: lead.fbp,
    fbc: lead.fbc,
  };
  const res = await sendMetaEvent({
    eventName: "QualifiedLead",
    eventId: `ql_${lead.id}`,
    sourceUrl: lead.url,
    user,
    customData: { lead_id: lead.id, content_category: lead.interest || "Santexnika", lead_status: "qualified" },
  });
  if (!res.ok) {
    await answer(cq.id, `Metaga yuborilmadi: ${res.error}`.slice(0, 190), true);
    return NextResponse.json({ ok: true });
  }

  // Sotuv linkini q=1 bilan yangilaymiz — keyin Purchase'da QualifiedLead qayta yuborilmaydi.
  const siteUrl = baseUrl(req);
  const token = makeLeadToken({
    id: lead.id,
    t: lead.t,
    url: lead.url,
    user,
    name: lead.name,
    phone,
    interest: lead.interest,
    q: true,
    tg: { c: String(msg.chat.id), m: msg.message_id, r: msg.message_id },
  });
  const kb = withQuality(msg.reply_markup, "q");
  kb.inline_keyboard = kb.inline_keyboard.map((row) =>
    row.map((b) => (b.url?.includes("/sotuv?") ? { ...b, url: `${siteUrl}/sotuv?t=${token}` } : b)),
  );
  await tg("editMessageReplyMarkup", { chat_id: msg.chat.id, message_id: msg.message_id, reply_markup: kb }).catch(
    (e) => console.error("[webhook]", e),
  );
  await answer(cq.id, `✅ Sifatli lid — Metaga yuborildi (${who})`);
  return NextResponse.json({ ok: true });
}
