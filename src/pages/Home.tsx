import { Link } from "react-router-dom";

const collections = [
  {
    title: "Bridal Reds",
    subtitle: "The eternal crimson",
    tag: "Bridal",
    img: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=600&h=800&fit=crop&auto=format",
  },
  {
    title: "Gold & Ivory",
    subtitle: "Sunlit elegance",
    tag: "Indo-Western",
    img: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=600&h=800&fit=crop&auto=format",
  },
  {
    title: "Dusty Rose",
    subtitle: "Soft femininity",
    tag: "Festive",
    img: "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=600&h=800&fit=crop&auto=format",
  },
  {
    title: "Midnight Zari",
    subtitle: "Modern heirloom",
    tag: "Bridal",
    img: "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=600&h=800&fit=crop&auto=format",
  },
];

const testimonials = [
  {
    quote: "Finding my bridal lehenga at The Lehenga Vault felt like a dream. The team understood exactly what I wanted.",
    name: "Priya Sharma",
    detail: "Bride, December 2023",
  },
  {
    quote: "Renting was seamless and the quality was stunning. Every guest thought I owned it!",
    name: "Ananya Reddy",
    detail: "Festive occasion, 2024",
  },
  {
    quote: "The Indo-Western pieces are unlike anything I've seen in Hyderabad. Truly curated.",
    name: "Meera Kapoor",
    detail: "Bride, March 2024",
  },
];

export default function Home() {
  return (
    <div className="bg-[#F5EDD8]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-end pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#2D2418]">
          <img
            src="https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=1400&h=1000&fit=crop&auto=format"
            alt="Bride in an exquisite bridal lehenga"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/80 via-[#1A1008]/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-6 font-medium">
              Hyderabad's Premier Bridal Atelier
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-[#FAF6ED] leading-[0.95] mb-6">
              Dressed for<br />
              <em className="italic text-[#D4B483]">the moment</em><br />
              of a lifetime.
            </h1>
            <div className="flex gap-4 mt-8">
              <Link
                to="/collections"
                className="px-7 py-3.5 bg-[#C9A84C] text-[#FAF6ED] text-sm tracking-widest uppercase font-medium hover:bg-[#B8924A] transition-colors"
              >
                Explore Collections
              </Link>
              <Link
                to="/rent-buy"
                className="px-7 py-3.5 border border-[#FAF6ED]/50 text-[#FAF6ED] text-sm tracking-widest uppercase font-medium hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
              >
                Rent or Buy
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3">
            {[
              ["500+", "Curated Pieces"],
              ["200+", "Happy Brides"],
              ["10+", "Designer Labels"],
            ].map(([num, label]) => (
              <div key={label} className="text-right">
                <p className="font-serif text-4xl text-[#D4B483] font-semibold">{num}</p>
                <p className="text-xs tracking-[0.2em] uppercase text-[#C4B49A]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-[#C9A84C]/50 animate-pulse" />
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#C9A84C]">Scroll</p>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#C9A84C] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="text-[#FAF6ED] text-xs tracking-[0.4em] uppercase mx-12 font-medium">
              Bridal · Indo-Western · Rent & Buy · Hyderabad · Curated Luxury · Festive Wear · Lehengas · Sarees · Anarkalis ·
            </span>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3">Featured</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold">This Season's<br />Edit</h2>
          </div>
          <Link
            to="/collections"
            className="hidden md:inline-flex items-center gap-2 text-sm tracking-widest uppercase text-[#8B6A3E] hover:text-[#C9A84C] transition-colors font-medium"
          >
            View all <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {collections.map((c, i) => (
            <div
              key={c.title}
              className={`group relative overflow-hidden bg-[#EDE3CC] ${i === 0 ? "md:row-span-2" : ""}`}
            >
              <div className={`relative overflow-hidden ${i === 0 ? "aspect-[3/4] md:h-full" : "aspect-[3/4]"}`}>
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block text-[8px] tracking-[0.3em] uppercase bg-[#C9A84C] text-[#FAF6ED] px-2 py-0.5 mb-2">
                  {c.tag}
                </span>
                <p className="font-serif text-lg text-[#FAF6ED] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {c.title}
                </p>
                <p className="text-xs text-[#D4B483] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {c.subtitle}
                </p>
              </div>
              <div className="p-4 bg-[#EDE3CC]">
                <p className="font-serif text-base text-[#2D2418] font-medium">{c.title}</p>
                <p className="text-xs text-[#8B6A3E] mt-0.5">{c.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Strip */}
      <section className="bg-[#2D2418] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-[#5C3D1E] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=700&h=875&fit=crop&auto=format"
                alt="Model in an elegant Indo-Western ensemble"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#C9A84C]/30 hidden md:block" />
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#C9A84C]/10 hidden md:block" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9A84C] mb-4 font-medium">Our Story</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDE3CC] font-semibold leading-tight mb-6">
              A vault of timeless<br />
              <em className="italic text-[#D4B483]">bridal treasures</em>
            </h2>
            <p className="text-[#C4B49A] leading-relaxed mb-4">
              Born from a belief that every bride deserves her perfect lehenga — whether owned or rented — The Lehenga Vault brings together the finest bridal and Indo-Western wear under one roof in Hyderabad.
            </p>
            <p className="text-[#C4B49A] leading-relaxed mb-8">
              Each piece in our vault is hand-selected by our team of bridal stylists, ensuring that what you wear tells a story as singular as yours.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-[#C9A84C] hover:gap-4 transition-all font-medium"
            >
              Discover our story <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 text-center font-medium">How we serve you</p>
        <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold text-center mb-16">
          Two ways to wear luxury
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              label: "Rent",
              heading: "Wear the dream,\nreturn with memories",
              body: "Borrow from our vault for 3–7 days. Ideal for one-time occasions like weddings, receptions, and festive events. Includes complimentary steaming and a stylist consultation.",
              price: "Starting ₹4,999",
              cta: "Explore Rentals",
              to: "/rent-buy",
              bg: "#EDE3CC",
            },
            {
              label: "Buy",
              heading: "An heirloom you\npass forward",
              body: "Own a piece from our curated collection of bridal and semi-bridal lehengas. Each purchase includes after-care, alteration support, and a heritage storage bag.",
              price: "Starting ₹28,000",
              cta: "Shop to Own",
              to: "/rent-buy",
              bg: "#2D2418",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-10 md:p-14 flex flex-col gap-5"
              style={{ backgroundColor: s.bg }}
            >
              <span
                className="text-[9px] tracking-[0.4em] uppercase font-medium px-3 py-1 w-fit"
                style={{
                  backgroundColor: s.bg === "#2D2418" ? "#C9A84C" : "#2D2418",
                  color: s.bg === "#2D2418" ? "#FAF6ED" : "#FAF6ED",
                }}
              >
                {s.label}
              </span>
              <h3
                className="font-serif text-3xl md:text-4xl font-semibold leading-tight whitespace-pre-line"
                style={{ color: s.bg === "#2D2418" ? "#EDE3CC" : "#2D2418" }}
              >
                {s.heading}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: s.bg === "#2D2418" ? "#C4B49A" : "#5C3D1E" }}
              >
                {s.body}
              </p>
              <p
                className="font-serif text-xl font-semibold"
                style={{ color: s.bg === "#2D2418" ? "#D4B483" : "#8B6A3E" }}
              >
                {s.price}
              </p>
              <Link
                to={s.to}
                className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-medium mt-2 hover:gap-4 transition-all"
                style={{ color: s.bg === "#2D2418" ? "#C9A84C" : "#2D2418" }}
              >
                {s.cta} <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#EDE3CC] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 text-center font-medium">Voices from the vault</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold text-center mb-16">
            What our brides say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#F5EDD8] p-8 relative">
                <span className="font-serif text-6xl text-[#C9A84C]/30 absolute top-4 left-6 leading-none select-none">
                  "
                </span>
                <p className="text-[#2D2418] leading-relaxed text-sm relative z-10 pt-6">{t.quote}</p>
                <div className="mt-6 pt-6 border-t border-[#D4C4A0]">
                  <p className="font-serif text-base font-semibold text-[#2D2418]">{t.name}</p>
                  <p className="text-xs tracking-wider uppercase text-[#8B6A3E] mt-0.5">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-28 overflow-hidden bg-[#2D2418]">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=1400&h=500&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative text-center px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-4 font-medium">Begin your journey</p>
          <h2 className="font-serif text-4xl md:text-6xl text-[#EDE3CC] font-semibold mb-6">
            Your bridal moment<br />
            <em className="italic text-[#D4B483]">awaits you.</em>
          </h2>
          <p className="text-[#C4B49A] max-w-lg mx-auto text-sm leading-relaxed mb-10">
            Book a private styling session at our Hyderabad atelier. Our bridal stylists will guide you through the vault, one piece at a time.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-[#C9A84C] text-[#FAF6ED] text-sm tracking-widest uppercase font-medium hover:bg-[#B8924A] transition-colors"
          >
            Book a Styling Session
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
