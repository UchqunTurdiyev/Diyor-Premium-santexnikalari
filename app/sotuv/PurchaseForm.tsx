"use client";

import { useEffect, useState } from "react";

const fmt = (raw: string) => raw.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function load(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
function save(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* private rejim */
  }
}

export default function PurchaseForm({
  token,
  defaultValue,
  currency,
  pinRequired,
}: {
  token: string;
  defaultValue?: number;
  currency: string;
  pinRequired: boolean;
}) {
  const [value, setValue] = useState(defaultValue ? fmt(String(defaultValue)) : "");
  const [seller, setSeller] = useState("");
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ value: number; n: number; ltv: number } | null>(null);

  useEffect(() => setSeller(load("sales_name")), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = Number(value.replace(/\D/g, ""));
    if (amount < 1000) return setError("To'langan summani kiriting");
    if (pinRequired && !pin) return setError("PIN kodni kiriting");

    setLoading(true);
    save("sales_name", seller.trim());
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, value: amount, pin, seller, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
      setDone({ value: data.value, n: data.n, ltv: data.ltv });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  if (done !== null) {
    return (
      <div className="sale-done">
        <div className="sale-done-icon">✅</div>
        <h2>Metaga yuborildi</h2>
        <p>
          <b>
            {fmt(String(done.value))} {currency}
          </b>{" "}
          Purchase sifatida qabul qilindi{done.n > 1 ? " (qayta xarid)" : ""}.
        </p>
        <p>
          Mijoz LTV: <b>{fmt(String(done.ltv))} {currency}</b> · {done.n} ta xarid
        </p>
        <p className="sale-muted">Keyingi xaridda Telegramdagi &quot;🔁 Qayta sotib oldi&quot; tugmasini bosing.</p>
        <p className="sale-muted">Sahifani yopishingiz mumkin.</p>
      </div>
    );
  }

  return (
    <form className="sale-form" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>To&apos;langan summa ({currency})</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Masalan: 4 500 000"
          value={value}
          onChange={(e) => setValue(fmt(e.target.value))}
          autoFocus
        />
      </label>
      <label className="field">
        <span>Sotuvchi ismi</span>
        <input type="text" placeholder="Masalan: Aziza" value={seller} onChange={(e) => setSeller(e.target.value)} />
      </label>
      <label className="field">
        <span>Izoh (ixtiyoriy)</span>
        <input type="text" placeholder="Naqd / karta, qaysi mahsulot..." value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {pinRequired && (
        <label className="field">
          <span>Sotuv PIN kodi</span>
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
        {loading ? <span className="spinner" aria-label="Yuborilmoqda" /> : "💰 Metaga yuborish"}
      </button>
      <p className="sale-muted sale-note">Har bir xarid bir marta yuboriladi — qayta bosilsa ham Meta dublikat hisoblamaydi.</p>
    </form>
  );
}
