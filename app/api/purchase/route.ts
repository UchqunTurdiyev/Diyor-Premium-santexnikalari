import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta";
import { baseUrl, decodeLeadToken, encodeLeadToken } from "@/lib/leadToken";
import { escapeHtml, fmtMoney, isPublicUrl, leadKeyboard, tg } from "@/lib/telegram";

export const runtime = "nodejs";

// SALES_PIN o'rnatilgan bo'lsa — PIN so'raladi. Bo'lmasa link (shifrlangan, faqat yopiq chatda) kifoya.
function pinOk(pin: string) {
  const expected = process.env.SALES_PIN;
  if (!expected) return true;
  const a = crypto.createHash("sha256").update(pin).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

// Har bir xarid:
//  • Meta "Purchase" { value, currency, purchase_number, customer_type, ltv }
//  • 2-xariddan boshlab qo'shimcha "RepeatPurchase" — qaytgan mijozlar auditoriyasi va LTV hisobi uchun
//  • lid hali "sifatli" deb belgilanmagan bo'lsa — "QualifiedLead" ham (xaridor = sifatli lid)
//  • Telegramda javob xabari + "🔁 Qayta sotib oldi" tugmasi (yangi n va LTV bilan shifrlangan link)
export async function POST(req: NextRequest) {
  try {
    const { token, value, pin, seller, note } = await req.json();

    if (!pinOk(String(pin ?? ""))) {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json({ error: "PIN noto'g'ri" }, { status: 401 });
    }

    let lead;
    try {
      lead = decodeLeadToken(String(token ?? ""));
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Link noto'g'ri" }, { status: 400 });
    }

    const amount = Math.round(Number(String(value ?? "").replace(/[^\d]/g, "")));
    if (!Number.isFinite(amount) || amount < 1000 || amount > 10_000_000_000) {
      return NextResponse.json({ error: "Summani to'g'ri kiriting (so'mda)" }, { status: 400 });
    }

    const currency = process.env.META_CURRENCY || "UZS";
    const sellerName = String(seller ?? "").trim().slice(0, 40);
    const cleanNote = String(note ?? "").trim().slice(0, 200);
    const sourceUrl = lead.url || baseUrl(req);

    const n = (lead.n || 0) + 1;
    const ltv = (lead.ltv || 0) + amount;
    const returning = n > 1;

    const customData = {
      currency,
      value: amount,
      order_id: `${lead.lid}-${n}`,
      content_name: "DIYOR santexnika buyurtma",
      content_category: lead.interest || "Santexnika",
      purchase_number: n,
      customer_type: returning ? "returning" : "new",
      ltv,
    };

    const events = [
      sendMetaEvent({
        eventName: "Purchase",
        // Lid + xarid raqami bo'yicha barqaror ID — bir link ikki marta yuborilsa ham Meta takrorni o'chiradi.
        eventId: `purchase_${lead.lid}_${n}`,
        sourceUrl,
        userData: lead.ud,
        customData,
      }),
    ];
    if (returning)
      events.push(
        sendMetaEvent({
          eventName: "RepeatPurchase",
          eventId: `repeat_${lead.lid}_${n}`,
          sourceUrl,
          userData: lead.ud,
          customData,
        }),
      );
    if (!lead.q)
      events.push(
        sendMetaEvent({
          eventName: "QualifiedLead",
          eventId: `ql_${lead.lid}`,
          sourceUrl,
          userData: lead.ud,
          customData: { lead_id: lead.lid, content_category: customData.content_category, lead_status: "purchased" },
        }),
      );

    const [purchase, ...rest] = await Promise.all(events);
    if (!purchase.ok) return NextResponse.json({ error: purchase.error || "Metaga yuborib bo'lmadi" }, { status: 502 });
    rest.forEach((r) => !r.ok && console.warn("[purchase] qo'shimcha hodisa", r.error));

    if (lead.tg) await updateTelegram(req, lead, { n, ltv, amount, currency, sellerName, cleanNote });

    return NextResponse.json({ ok: true, leadId: lead.lid, value: amount, currency, n, ltv });
  } catch (e) {
    console.error("[purchase]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server xatosi" }, { status: 500 });
  }
}

async function updateTelegram(
  req: NextRequest,
  lead: ReturnType<typeof decodeLeadToken>,
  s: { n: number; ltv: number; amount: number; currency: string; sellerName: string; cleanNote: string },
) {
  const { c, m } = lead.tg!;
  const root = lead.tg!.r ?? m;
  const siteUrl = baseUrl(req);

  // 1) Bosilgan tugmani olib tashlaymiz (qayta yuborilmasin).
  //    Asl lid xabarida: qo'ng'iroq + "✅ Sifatli lid" qoladi. LTV javob xabarida: tugmasiz.
  const markup =
    m === root
      ? (({ inline_keyboard }) => ({ inline_keyboard: inline_keyboard.filter((row) => !row.some((b) => b.url?.includes("/sotuv?"))) }))(
          leadKeyboard({ siteUrl, phone: lead.p || "", quality: "q" }),
        )
      : { inline_keyboard: [] };
  await tg("editMessageReplyMarkup", { chat_id: c, message_id: m, reply_markup: markup }).catch((e) =>
    console.error("[purchase] tg edit", e),
  );

  // 2) Javob xabari: xarid summasi + LTV, va keyingi xarid uchun tugma.
  const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const text =
    `✅ <b>${s.n > 1 ? `Qayta xarid #${s.n}` : "Sotib oldi"} — Metaga yuborildi</b>\n\n` +
    `💰 Summa: <b>${fmtMoney(s.amount)} ${escapeHtml(s.currency)}</b>\n` +
    `📈 LTV: <b>${fmtMoney(s.ltv)} ${escapeHtml(s.currency)}</b> · ${s.n} ta xarid\n` +
    (s.sellerName ? `👨‍💼 Sotuvchi: ${escapeHtml(s.sellerName)}\n` : "") +
    (s.cleanNote ? `📝 Izoh: ${escapeHtml(s.cleanNote)}\n` : "") +
    `🕒 ${escapeHtml(time)}`;

  try {
    const reply = await tg<{ message_id: number }>("sendMessage", {
      chat_id: c,
      text,
      parse_mode: "HTML",
      reply_parameters: { message_id: root, allow_sending_without_reply: true },
    });
    const next = encodeLeadToken({ ...lead, q: 1, n: s.n, ltv: s.ltv, tg: { c, m: reply.message_id, r: root } });
    const url = `${siteUrl}/sotuv?t=${next}`;
    if (isPublicUrl(url))
      await tg("editMessageReplyMarkup", {
        chat_id: c,
        message_id: reply.message_id,
        reply_markup: { inline_keyboard: [[{ text: "🔁 Qayta sotib oldi → summa kiritish", url }]] },
      });
  } catch (e) {
    console.error("[purchase] tg reply", e);
  }
}
