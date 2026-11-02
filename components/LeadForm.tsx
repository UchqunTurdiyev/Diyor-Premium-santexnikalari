"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, getFbc, track, trackCustom } from "./MetaPixel";
import { interests } from "@/lib/site";

// +998 (90) 123-45-67 ko'rinishidagi niqob
function maskPhone(value: string) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  let out = "+998";
  if (d.length > 0) out += ` (${d.slice(0, 2)}`;
  if (d.length >= 2) out += ")";
  if (d.length > 2) out += ` ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

const newEventId = () => `lead_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// Qaysi reklamadan kelganini sotuvchi ham ko'rsin (utm_campaign / utm_content)
function utmSource() {
  const p = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_campaign", "utm_content"]
    .map((k) => p.get(k))
    .filter(Boolean)
    .join(" / ");
}

export default function LeadForm({
  title = "Bepul maslahat olishni xohlaysizmi?",
  subtitle = "Mutaxassislarimiz siz uchun eng mos santexnika mahsulotlarini tanlashda yordam beradi",
  dark = false,
}: {
  title?: string;
  subtitle?: string;
  dark?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [interest, setInterest] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const router = useRouter();

  function onFirstFocus() {
    if (started) return;
    setStarted(true);
    // forma bilan ishlay boshlagan foydalanuvchilar — retarget uchun signal
    trackCustom("FormStart", { content_name: "Bepul maslahat formasi" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Ismingizni kiriting");
    if (digits.length !== 12) return setError("Telefon raqamni to'liq kiriting");

    setStatus("sending");
    const eventId = newEventId();
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: digits,
          interest,
          website,
          eventId,
          url: window.location.href,
          src: utmSource(),
          fbp: decodeURIComponent(getCookie("_fbp")),
          fbc: getFbc(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik yuz berdi");

      // Pixel + CAPI bir xil eventID bilan — Meta takrorni o'zi olib tashlaydi.
      track("Lead", { content_name: "Bepul maslahat", content_category: interest || "Santexnika" }, eventId);
      router.push(`/rahmat?name=${encodeURIComponent(name.trim().split(/\s+/)[0])}`);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  }

  return (
    <form className={`lead-form${dark ? " dark" : ""}`} onSubmit={onSubmit} onFocus={onFirstFocus} noValidate>
      <div className="form-head">
        <span className="pill">
          <i className="dot" /> Bepul · 15 daqiqada javob
        </span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <label className="field">
        <span>Ismingiz</span>
        <input
          type="text"
          name="name"
          autoComplete="given-name"
          placeholder="Masalan: Jasur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Telefon raqamingiz</span>
        <input
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 (90) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(maskPhone(e.target.value))}
          required
        />
      </label>

      <fieldset className="chips">
        <legend>Nima kerak? (ixtiyoriy)</legend>
        {interests.map((it) => (
          <button
            type="button"
            key={it}
            className={`chip${interest === it ? " on" : ""}`}
            aria-pressed={interest === it}
            onClick={() => setInterest(interest === it ? "" : it)}
          >
            {it}
          </button>
        ))}
      </fieldset>

      {/* bot-tuzoq: odamlar ko'rmaydi */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-cta btn-lg btn-block" type="submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <span className="spinner" aria-label="Yuborilmoqda" />
        ) : (
          <>
            Hoziroq bog&apos;lanish
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path fill="currentColor" d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3 1.4-1.4Z" />
            </svg>
          </>
        )}
      </button>

      <p className="form-note">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
          <path
            fill="currentColor"
            d="M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4Zm-1.2 15.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"
          />
        </svg>
        Raqamingiz faqat maslahat uchun ishlatiladi. Spam yo&apos;q.
      </p>
    </form>
  );
}
