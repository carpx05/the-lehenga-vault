import { useRef } from "react"
import { Link } from "react-router-dom"
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap"

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
]

const stats = [
  { value: 500, suffix: "+", label: "Curated Pieces" },
  { value: 200, suffix: "+", label: "Happy Brides" },
  { value: 10, suffix: "+", label: "Designer Labels" },
]

const testimonials = [
  {
    quote:
      "Finding my bridal lehenga at The Lehenga Vault felt like a dream. The team understood exactly what I wanted.",
    name: "Priya Sharma",
    detail: "Bride, August 2026",
  },
  {
    quote:
      "Renting was seamless and the quality was stunning. Every guest thought I owned it!",
    name: "Ananya Reddy",
    detail: "Festive occasion, 2026",
  },
  {
    quote:
      "The Indo-Western pieces are unlike anything I've seen in Thane. Truly curated.",
    name: "Meera Kapoor",
    detail: "Bride, September 2026",
  },
]

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        const counters =
          containerRef.current?.querySelectorAll<HTMLElement>(".stat-counter")
        counters?.forEach((el) => {
          el.textContent = el.dataset.target || "0"
        })
        return
      }

      // Hero text subtle fade-up stagger
      gsap.from(".hero-text-item", {
        y: 35,
        opacity: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.15,
      })

      // Hero background image subtle parallax
      gsap.to(".hero-bg-img", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })

      // Hero stats count-up trigger
      const counters =
        containerRef.current?.querySelectorAll<HTMLElement>(".stat-counter")
      counters?.forEach((counter) => {
        const target = parseInt(counter.dataset.target || "0", 10)
        const tracker = { val: 0 }
        gsap.to(tracker, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".hero-stats",
            start: "top 95%",
            once: true,
          },
          onUpdate: () => {
            counter.textContent = Math.floor(tracker.val).toString()
          },
        })
      })

      // Collections section header & cards
      gsap.from(".collections-header", {
        scrollTrigger: {
          trigger: ".collections-section",
          start: "top 85%",
          once: true,
        },
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
      })

      // Cards animate with translateY only (no opacity: 0 lock-in) so they are NEVER invisible
      gsap.from(".collection-card", {
        scrollTrigger: {
          trigger: ".collections-section",
          start: "top 85%",
          once: true,
        },
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all",
      })

      // About Strip section
      gsap.from(".about-strip-img", {
        scrollTrigger: {
          trigger: ".about-strip-section",
          start: "top 75%",
          once: true,
        },
        scale: 1.08,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
      })

      gsap.from(".about-strip-content > *", {
        scrollTrigger: {
          trigger: ".about-strip-section",
          start: "top 75%",
          once: true,
        },
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      })

      // Testimonials section
      gsap.from(".testimonials-header", {
        scrollTrigger: {
          trigger: ".testimonials-section",
          start: "top 85%",
          once: true,
        },
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: "power2.out",
      })

      gsap.from(".testimonial-card", {
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 80%",
          once: true,
        },
        y: 35,
        opacity: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: "power2.out",
      })

      // CTA Banner parallax and reveal
      gsap.to(".cta-bg-img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta-banner-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })

      gsap.from(".cta-content > *", {
        scrollTrigger: {
          trigger: ".cta-banner-section",
          start: "top 75%",
          once: true,
        },
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: "power2.out",
      })
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="bg-[#F5EDD8]">
      {/* Hero */}
      <section className="hero-section relative min-h-screen flex items-end pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#2D2418] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=1400&h=1000&fit=crop&auto=format"
            alt="Bride in an exquisite bridal lehenga"
            className="hero-bg-img w-full h-full object-cover opacity-60 scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/80 via-[#1A1008]/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="hero-text-item text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-6 font-medium">
              Thane's Premier Bridal Atelier
            </p>
            <h1 className="hero-text-item font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-[#FAF6ED] leading-[0.95] mb-6">
              Dressed for
              <br />
              <em className="italic text-[#D4B483]">the moment</em>
              <br />
              of a lifetime.
            </h1>
            <div className="hero-text-item flex gap-4 mt-8">
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
          <div className="hidden md:flex flex-col items-end gap-3 hero-stats">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="text-right">
                <p className="font-serif text-4xl text-[#D4B483] font-semibold">
                  <span className="stat-counter" data-target={value}>
                    0
                  </span>
                  {suffix}
                </p>
                <p className="text-xs tracking-[0.2em] uppercase text-[#C4B49A]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-[#C9A84C]/50 animate-pulse" />
          <p className="text-[9px] tracking-[0.4em] uppercase text-[#C9A84C]">
            Scroll
          </p>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#C9A84C] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <span
                key={i}
                className="text-[#FAF6ED] text-xs tracking-[0.4em] uppercase mx-12 font-medium"
              >
                Bridal · Indo-Western · Rent & Buy · Thane · Curated Luxury ·
                Festive Wear · Lehengas · Sarees · Anarkalis ·
              </span>
            ))}
        </div>
      </div>

      {/* Collections Grid */}
      <section className="collections-section max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="collections-header flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3">
              Featured
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold">
              This Season's
              <br />
              Edit
            </h2>
          </div>
          <Link
            to="/collections"
            className="hidden md:inline-flex items-center gap-2 text-sm tracking-widest uppercase text-[#8B6A3E] hover:text-[#C9A84C] transition-colors font-medium"
          >
            View all <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="collections-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {collections.map((c) => (
            <div
              key={c.title}
              className="collection-card group relative overflow-hidden bg-[#EDE3CC] border border-[#D4C4A0]/40 transition-all duration-300 hover:shadow-md"
            >
              <Link to="/collections" className="block">
                {/* Image Container with aspect ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE3CC]">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Category Tag Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[8px] tracking-[0.25em] uppercase bg-[#C9A84C] text-[#FAF6ED] px-2.5 py-1 font-semibold shadow-sm">
                      {c.tag}
                    </span>
                  </div>

                  {/* In-Image Hover Action (Constrained strictly to image container) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008]/80 via-[#1A1008]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
                    <span className="w-full text-center py-2 bg-[#FAF6ED] text-[#2D2418] text-[11px] tracking-widest uppercase font-semibold transition-transform duration-300 translate-y-2 group-hover:translate-y-0 shadow-sm">
                      View Collection →
                    </span>
                  </div>
                </div>

                {/* Clean Details Panel Below Photo (Never Overlapped) */}
                <div className="p-4 bg-[#EDE3CC]">
                  <p className="font-serif text-base text-[#2D2418] font-semibold group-hover:text-[#8B6A3E] transition-colors">
                    {c.title}
                  </p>
                  <p className="text-xs text-[#8B6A3E] mt-0.5 tracking-wider">
                    {c.subtitle}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* About Strip */}
      <section className="about-strip-section bg-[#2D2418] py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-[#5C3D1E] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=700&h=875&fit=crop&auto=format"
                alt="Model in an elegant Indo-Western ensemble"
                className="about-strip-img w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#C9A84C]/30 hidden md:block" />
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#C9A84C]/10 hidden md:block" />
          </div>
          <div className="about-strip-content">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9A84C] mb-4 font-medium">
              Our Story
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDE3CC] font-semibold leading-tight mb-6">
              A vault of timeless
              <br />
              <em className="italic text-[#D4B483]">bridal treasures</em>
            </h2>
            <p className="text-[#C4B49A] leading-relaxed mb-4">
              Born from a belief that every bride deserves her perfect lehenga —
              whether owned or rented — The Lehenga Vault brings together the
              finest bridal and Indo-Western wear under one roof in Thane.
            </p>
            <p className="text-[#C4B49A] leading-relaxed mb-8">
              Each piece in our vault is hand-selected by our team of bridal
              stylists, ensuring that what you wear tells a story as singular as
              yours.
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

      {/* Testimonials */}
      <section className="testimonials-section bg-[#EDE3CC] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="testimonials-header">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 text-center font-medium">
              Voices from the vault
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold text-center mb-16">
              What our brides say
            </h2>
          </div>
          <div className="testimonials-grid grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card bg-[#F5EDD8] p-8 relative"
              >
                <span className="font-serif text-6xl text-[#C9A84C]/30 absolute top-4 left-6 leading-none select-none">
                  "
                </span>
                <p className="text-[#2D2418] leading-relaxed text-sm relative z-10 pt-6">
                  {t.quote}
                </p>
                <div className="mt-6 pt-6 border-t border-[#D4C4A0]">
                  <p className="font-serif text-base font-semibold text-[#2D2418]">
                    {t.name}
                  </p>
                  <p className="text-xs tracking-wider uppercase text-[#8B6A3E] mt-0.5">
                    {t.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner-section relative py-28 overflow-hidden bg-[#2D2418]">
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=1400&h=500&fit=crop&auto=format"
            alt=""
            className="cta-bg-img w-full h-full object-cover scale-110"
          />
        </div>
        <div className="cta-content relative text-center px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-4 font-medium">
            Begin your journey
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-[#EDE3CC] font-semibold mb-6">
            Your bridal moment
            <br />
            <em className="italic text-[#D4B483]">awaits you.</em>
          </h2>
          <p className="text-[#C4B49A] max-w-lg mx-auto text-sm leading-relaxed mb-10">
            Book a private styling session at our Thane atelier. Our bridal
            stylists will guide you through the vault, one piece at a time.
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
  )
}
