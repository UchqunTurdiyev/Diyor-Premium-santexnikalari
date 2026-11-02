// Saytdagi barcha matn va kontaktlar shu yerda — o'zgartirish oson bo'lsin uchun.

export const site = {
  name: "DIYOR",
  full: "Diyor — premium keramika va santexnika do'koni",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  phone: process.env.NEXT_PUBLIC_PHONE || "+998907102555",
  phone2: process.env.NEXT_PUBLIC_PHONE_2 || "+998907104449",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "diyor_since_2004",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || "",
  hours: "Dushanba–Shanba, 09:00–18:00",
};

export const instagramLink = `https://www.instagram.com/${site.instagram}/`;
export const telegramLink = site.telegram ? `https://t.me/${site.telegram}` : "";
export const phoneHref = (p = site.phone) => `tel:${p.replace(/[^\d+]/g, "")}`;

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 12) return raw;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

// Sarlavha tagidagi 4 ta asosiy va'da
export const promises = [
  {
    icon: "shield",
    title: "10 yilgacha kafolat",
    text: "Barcha mahsulotlarga rasmiy ishlab chiqaruvchi kafolati beriladi.",
  },
  {
    icon: "factory",
    title: "Ishlab chiqaruvchidan to'g'ridan-to'g'ri",
    text: "Vositachilarsiz — eng yaxshi narxlar.",
  },
  {
    icon: "expert",
    title: "Professional maslahat",
    text: "Tajribali mutaxassislarimiz sizga eng to'g'ri tanlov qilishda yordam beradi.",
  },
  {
    icon: "truck",
    title: "Tez yetkazib berish",
    text: "Toshkent bo'ylab 1–2 kun ichida. Butun O'zbekiston bo'ylab 3–7 kun.",
  },
] as const;

export const brands = [
  { file: "grohe", name: "GROHE", country: "Germaniya" },
  { file: "hansgrohe", name: "Hansgrohe", country: "Germaniya" },
  { file: "geberit", name: "Geberit", country: "Shveytsariya" },
  { file: "vitra", name: "VitrA", country: "Turkiya" },
  { file: "roca", name: "Roca", country: "Ispaniya" },
  { file: "jaquar", name: "Jaquar", country: "Hindiston" },
  { file: "tork", name: "Tork", country: "Shvetsiya" },
] as const;

export const stats = [
  { value: 22, suffix: " yil", label: "bozorda tajriba" },
  { value: 52000, suffix: "+", label: "mamnun mijoz" },
  { value: 5000, suffix: "+", label: "mahsulot omborda" },
  { value: 10, suffix: "", label: "jahon brendi" },
] as const;

// Forma ichidagi "nima kerak?" tanlovi — lid sifatini oshiradi, sotuvchiga kontekst beradi
export const interests = [
  "Vanna xonasi to'liq",
  "Smesitel / kran",
  "Unitaz / installyatsiya",
  "Dush tizimi",
  "Keramika / plitka",
  "Boshqa",
] as const;

export const pains = [
  {
    title: "Soxta “brend” mahsulot",
    text: "Bozordagi arzon “GROHE” 1–2 yilda oqa boshlaydi. Asl mahsulot 15–20 yil xizmat qiladi.",
  },
  {
    title: "Vositachilar ustamasi",
    text: "Har bir qo'ldan qo'lga o'tishda narx 20–40% ga oshadi. Siz esa ortiqcha to'laysiz.",
  },
  {
    title: "Noto'g'ri tanlov",
    text: "O'lcham, ulanish turi yoki suv bosimiga mos kelmagan santexnika — qayta ta'mir degani.",
  },
] as const;

export const steps = [
  {
    title: "Ariza qoldiring",
    text: "Ism va raqamingizni yozing — 30 soniya vaqt oladi.",
  },
  {
    title: "Bepul maslahat oling",
    text: "Mutaxassis qo'ng'iroq qilib, ehtiyoj va byudjetingizga mos variantlarni tanlab beradi.",
  },
  {
    title: "Uyingizga yetkazamiz",
    text: "Toshkentda 1–2 kunda, viloyatlarga 3–7 kunda. Rasmiy kafolat taloni bilan.",
  },
] as const;

export const faq = [
  {
    q: "Mahsulotlar asl ekanini qanday bilaman?",
    a: "Biz GROHE, Hansgrohe, Geberit, VitrA va boshqa brendlarning rasmiy distribyutorimiz. Har bir mahsulot ishlab chiqaruvchi kafolat taloni va hujjatlari bilan beriladi.",
  },
  {
    q: "Kafolat qancha muddatga beriladi?",
    a: "Brend va mahsulot turiga qarab 10 yilgacha rasmiy ishlab chiqaruvchi kafolati beriladi. Aniq muddatni mutaxassisimiz tanlangan model bo'yicha aytib beradi.",
  },
  {
    q: "Maslahat haqiqatan ham bepulmi?",
    a: "Ha. Mutaxassis siz bilan bog'lanib, savollaringizga javob beradi va mos variantlarni tavsiya qiladi. Sotib olish majburiyati yo'q.",
  },
  {
    q: "Viloyatlarga yetkazib berasizmi?",
    a: "Ha, butun O'zbekiston bo'ylab 3–7 kun ichida yetkazib beramiz. Toshkent bo'ylab — 1–2 kun.",
  },
  {
    q: "Narxlar nega bozordan arzonroq?",
    a: "Chunki biz ishlab chiqaruvchidan to'g'ridan-to'g'ri olib kelamiz — oradagi vositachilar ustamasi yo'q.",
  },
] as const;
