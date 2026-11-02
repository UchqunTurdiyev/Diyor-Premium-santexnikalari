import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import Icon from "@/components/Icons";
import { brands, faq, formatPhone, instagramLink, pains, phoneHref, promises, site, stats, steps } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ===== Header ===== */}
      <header className="topbar">
        <div className="wrap topbar-in">
          <a href="#" className="logo" aria-label="DIYOR — bosh sahifa">
            <Image src="/logo.png" alt="DIYOR" width={154} height={32} priority />
          </a>
          <a className="top-phone" href={phoneHref()}>
            <Icon name="phone" size={18} />
            <span>{formatPhone(site.phone)}</span>
          </a>
          <a className="btn btn-cta btn-sm" href="#ariza">
            Bepul maslahat
          </a>
        </div>
      </header>

      <main>
        {/* ===== Hero: taklif + forma ===== */}
        <section className="hero">
          <div className="hero-bg" aria-hidden>
            <span className="ring r1" />
            <span className="ring r2" />
            <span className="ring r3" />
          </div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow rise" style={{ ["--d" as string]: "0ms" }}>
                GROHE · Hansgrohe · Geberit · VitrA rasmiy distribyutori
              </p>
              <h1 className="rise" style={{ ["--d" as string]: "80ms" }}>
                Premium santexnika — <em>ishlab chiqaruvchi narxida</em> va 10 yillik kafolat bilan
              </h1>

              <ul className="promises">
                {promises.map((p, i) => (
                  <li key={p.title} className="rise" style={{ ["--d" as string]: `${180 + i * 80}ms` }}>
                    <span className="p-ico">
                      <Icon name={p.icon} size={22} />
                    </span>
                    <div>
                      <b>{p.title}</b>
                      <span>{p.text}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hero-proof rise" style={{ ["--d" as string]: "520ms" }}>
                <div className="avatars" aria-hidden>
                  <i>A</i>
                  <i>D</i>
                  <i>S</i>
                  <i>+</i>
                </div>
                <p>
                  <b>52 000+</b> oila 2004-yildan beri bizni tanlagan
                </p>
              </div>
            </div>

            <div id="ariza" className="hero-form rise" style={{ ["--d" as string]: "200ms" }}>
              <LeadForm />
            </div>
          </div>
        </section>

        {/* ===== Brendlar ===== */}
        <section className="brands" aria-label="Rasmiy hamkor brendlar">
          <p className="brands-title">Dunyoning yetakchi brendlari — rasmiy kafolat bilan</p>
          <div className="marquee">
            <div className="marquee-track">
              {[...brands, ...brands].map((b, i) => (
                <div className="brand" key={i} aria-hidden={i >= brands.length}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/brands/${b.file}.svg`} alt={b.name} width={120} height={56} loading="lazy" decoding="async" />
                  <span>{b.country}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Raqamlar ===== */}
        <section className="stats wrap">
          {stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <b data-count={s.value} data-suffix={s.suffix}>
                0{s.suffix}
              </b>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {/* ===== Muammo ===== */}
        <section className="section pains">
          <div className="wrap">
            <h2 data-reveal>
              Santexnikani noto&apos;g&apos;ri tanlash <em>ikki marta qimmatga</em> tushadi
            </h2>
            <p className="lead-text" data-reveal>
              Vanna xonasi 15–20 yilga bir ta&apos;mirlanadi. Bugun tejalgan bir necha yuz ming so&apos;m ertaga plitkani
              buzib, qayta ta&apos;mirlashga aylanadi.
            </p>
            <div className="pain-grid">
              {pains.map((p, i) => (
                <article className="pain" key={p.title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                  <span className="pain-ico">
                    <Icon name="x" size={18} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Yechim / afzalliklar ===== */}
        <section className="section solution">
          <div className="wrap">
            <h2 data-reveal>
              DIYOR bilan — <em>asl mahsulot, to&apos;g&apos;ri narx, to&apos;g&apos;ri tanlov</em>
            </h2>
            <div className="sol-grid">
              {promises.map((p, i) => (
                <article className="sol" key={p.title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                  <span className="sol-ico">
                    <Icon name={p.icon} size={26} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Qanday ishlaydi ===== */}
        <section className="section steps-sec">
          <div className="wrap">
            <h2 data-reveal>3 qadam — va santexnikangiz uyingizda</h2>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }}>
                  <span className="step-n">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="center" data-reveal>
              <a href="#ariza" className="btn btn-navy btn-lg">
                Bepul maslahat olish
              </a>
            </div>
          </div>
        </section>

        {/* ===== Kuchli taklif + 2-forma ===== */}
        <section className="offer" id="taklif">
          <div className="hero-bg" aria-hidden>
            <span className="ring r1" />
            <span className="ring r2" />
          </div>
          <div className="wrap offer-grid">
            <div className="offer-copy" data-reveal>
              <span className="pill pill-light">100% bepul · majburiyatsiz</span>
              <h2>Bepul maslahat olishni xohlaysizmi?</h2>
              <p>
                Mutaxassislarimiz siz uchun eng mos santexnika mahsulotlarini tanlashda yordam beradi — o&apos;lcham,
                ulanish turi va byudjetingizga qarab.
              </p>
              <ul className="ticks">
                <li>
                  <Icon name="check" size={20} /> Vanna xonangiz uchun tayyor to&apos;plam tavsiyasi
                </li>
                <li>
                  <Icon name="check" size={20} /> Asl va soxta mahsulotni farqlash bo&apos;yicha maslahat
                </li>
                <li>
                  <Icon name="check" size={20} /> Eng yaxshi narx — ishlab chiqaruvchidan to&apos;g&apos;ridan-to&apos;g&apos;ri
                </li>
                <li>
                  <Icon name="check" size={20} /> Sotib olish majburiyati yo&apos;q
                </li>
              </ul>
              <a className="offer-phone" href={phoneHref()}>
                <Icon name="phone" size={20} /> yoki qo&apos;ng&apos;iroq qiling: <b>{formatPhone(site.phone)}</b>
              </a>
            </div>
            <div className="offer-form" data-reveal>
              <LeadForm title="Hoziroq bog'laning" subtitle="Ariza qoldiring — mutaxassis 15 daqiqa ichida qo'ng'iroq qiladi" />
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="section faq-sec">
          <div className="wrap narrow">
            <h2 data-reveal>Ko&apos;p beriladigan savollar</h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.q} data-reveal>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="wrap footer-in">
          <div>
            <Image src="/logo.png" alt="DIYOR" width={154} height={32} />
            <p>Premium keramika va santexnika do&apos;koni. 2004-yildan beri.</p>
          </div>
          <div className="footer-contacts">
            <a href={phoneHref()}>{formatPhone(site.phone)}</a>
            <a href={phoneHref(site.phone2)}>{formatPhone(site.phone2)}</a>
            <span>
              <Icon name="clock" size={16} /> {site.hours}
            </span>
            <a href={instagramLink} target="_blank" rel="noopener noreferrer">
              <Icon name="insta" size={16} /> @{site.instagram}
            </a>
          </div>
        </div>
        <p className="wrap copy">© {new Date().getFullYear()} DIYOR. Barcha huquqlar himoyalangan.</p>
      </footer>

      {/* ===== Mobil pastki panel ===== */}
      <div className="mobile-bar">
        <a className="btn btn-ghost" href={phoneHref()} aria-label="Qo'ng'iroq qilish">
          <Icon name="phone" size={20} />
        </a>
        <a className="btn btn-cta btn-block" href="#ariza">
          Bepul maslahat olish
        </a>
      </div>
    </>
  );
}
