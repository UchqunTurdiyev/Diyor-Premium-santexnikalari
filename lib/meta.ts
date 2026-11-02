import { createHash } from "crypto";

// Meta Conversions API (server tomoni).
// https://developers.facebook.com/docs/marketing-api/conversions-api

const GRAPH_VERSION = "v21.0";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export type MetaUser = {
  phone?: string;
  name?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type MetaEvent = {
  // Standart: Lead, Purchase, Contact. Maxsus: QualifiedLead, RepeatPurchase.
  eventName: "Lead" | "Purchase" | "Contact" | "QualifiedLead" | "RepeatPurchase";
  eventId: string;
  eventTime?: number; // unix soniya
  sourceUrl?: string;
  user?: MetaUser;
  userData?: Record<string, unknown>; // oldindan heshlangan user_data (sotuv linkidan)
  customData?: Record<string, unknown>;
};

export function buildUserData(u: MetaUser) {
  const data: Record<string, unknown> = { country: [sha256("uz")] };

  const phone = u.phone?.replace(/\D/g, "");
  if (phone) data.ph = [sha256(phone)];

  const parts = (u.name || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts[0]) data.fn = [sha256(parts[0])];
  if (parts.length > 1) data.ln = [sha256(parts.slice(1).join(" "))];

  if (u.externalId) data.external_id = [sha256(u.externalId)];
  if (u.ip) data.client_ip_address = u.ip;
  if (u.userAgent) data.client_user_agent = u.userAgent;
  if (u.fbp) data.fbp = u.fbp;
  if (u.fbc) data.fbc = u.fbc;
  return data;
}

export async function sendMetaEvent(ev: MetaEvent): Promise<{ ok: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return { ok: false, error: "Meta Pixel ID yoki CAPI token sozlanmagan" };

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: ev.eventName,
        event_time: ev.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: "website",
        event_source_url: ev.sourceUrl,
        user_data: ev.userData ?? buildUserData(ev.user ?? {}),
        custom_data: ev.customData,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("[meta capi]", res.status, text);
      // Meta xatosini tushunarli qilib qaytaramiz
      try {
        const j = JSON.parse(text);
        if (j?.error?.message) return { ok: false, error: `Meta: ${j.error.error_user_msg || j.error.message}` };
      } catch {}
      return { ok: false, error: `Meta ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[meta capi]", e);
    return { ok: false, error: String(e) };
  }
}
