import { NextRequest, NextResponse } from "next/server";
import { tg } from "@/lib/telegram";
import { baseUrl } from "@/lib/leadToken";

export const runtime = "nodejs";

// Deploydan keyin bir marta oching:
//   https://SAYT/api/telegram/setup?key=TELEGRAM_WEBHOOK_SECRET
// "⭐ Sifatli lid / 🚫 Sifatsiz" tugmalari ishlashi uchun bot webhookini o'rnatadi.
export async function GET(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.nextUrl.searchParams.get("key") !== secret) {
    return NextResponse.json(
      { ok: false, error: "key noto'g'ri yoki TELEGRAM_WEBHOOK_SECRET sozlanmagan" },
      { status: 401 },
    );
  }

  const url = `${baseUrl(req)}/api/telegram/webhook`;
  try {
    await tg("setWebhook", { url, secret_token: secret, allowed_updates: ["callback_query"] });
    const info = await tg("getWebhookInfo", {});
    return NextResponse.json({ ok: true, url, info });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
