import { useState } from "react"
import { Link } from "react-router-dom"

const rentSteps = [
  {
    n: "01",
    title: "Browse & Select",
    body: "Explore our online vault or visit our Thane atelier. Filter by occasion, color, and designer.",
  },
  {
    n: "02",
    title: "Book Your Trial",
    body: "Schedule a private 90-minute styling session. Our bridal stylists will walk you through your shortlisted pieces.",
  },
  {
    n: "03",
    title: "Receive & Wear",
    body: "Your lehenga arrives steam-pressed, packed in our heritage garment bag — 24 hours before your event.",
  },
  {
    n: "04",
    title: "Return with Ease",
    body: "Simply drop off within 48 hours of the event. We handle the rest — cleaning, care, and storage.",
  },
]

const rentPlans = [
  {
    name: "Everyday Elegance",
    price: "₹4,999",
    period: "3-day rental",
    tag: "Festive & Function",
    features: [
      "Festive & reception lehengas",
      "Complimentary steaming",
      "1 styling consultation (30 min)",
      "Heritage garment bag",
      "No security deposit up to ₹40,000",
    ],
  },
  {
    name: "Bridal Vault",
    price: "₹9,999",
    period: "5-day rental",
    tag: "Most Popular",
    features: [
      "All bridal & indo-western pieces",
      "Priority access to new arrivals",
      "2 styling consultations",
      "Complimentary minor alterations",
      "Heritage garment bag & dupatta press",
      "Dedicated stylist on event morning",
    ],
    highlight: true,
  },
  {
    name: "Extended Celebration",
    price: "₹14,999",
    period: "7-day rental",
    tag: "Full Wedding Week",
    features: [
      "Any 2 pieces from the vault",
      "Unlimited styling sessions",
      "Full alteration support",
      "Courier delivery option (metro cities)",
      "Priority scheduling",
      "Post-event documentation shoot",
    ],
  },
]

const faqs = [
  {
    q: "What is the security deposit for rentals?",
    a: "A refundable security deposit of 20% of the garment's retail value is collected. It is returned within 3 working days of successful garment return.",
  },
  {
    q: "Can I have the lehenga altered?",
    a: "Minor alterations (waist, hem, blouse length) are included in the Bridal Vault and Extended Celebration plans. For purchase pieces, a full alteration is included.",
  },
  {
    q: "What if I damage or stain the rental piece?",
    a: "Minor stains are covered under our standard care policy. For significant damage, a repair fee is assessed based on the extent and nature of the damage.",
  },
  {
    q: "Can I rent for destinations outside Thane?",
    a: "Yes! We offer courier delivery to Delhi, Mumbai, Bangalore, and Chennai for the Extended Celebration plan. Shipping fees apply.",
  },
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 4-6 weeks before your event date. For peak wedding season (October-February), 3 months in advance is ideal.",
  },
]

export default function RentBuy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-[#F5EDD8] min-h-screen">
      {/* Header */}
      <div className="bg-[#2D2418] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-3 font-medium">
              Flexible luxury
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#EDE3CC] font-semibold leading-tight mb-6">
              Rent or Buy —<br />
              <em className="italic text-[#D4B483]">your choice.</em>
            </h1>
            <p className="text-[#C4B49A] leading-relaxed max-w-md">
              Own an heirloom. Or wear a dream for the day. The Lehenga Vault
              gives you both options, always with the same care, craft, and
              attention to detail.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Rental Pieces Available", value: "380+" },
              { label: "Happy Rental Brides", value: "160+" },
              { label: "Purchase Pieces", value: "120+" },
              { label: "Avg. Customer Rating", value: "4.9 ★" },
            ].map((s) => (
              <div key={s.label} className="bg-[#3D3020] p-6">
                <p className="font-serif text-3xl text-[#D4B483] font-semibold">
                  {s.value}
                </p>
                <p className="text-xs tracking-wider uppercase text-[#8B6A3E] mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How Renting Works */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 font-medium">
          Rental Process
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold mb-16">
          How it works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {rentSteps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-serif text-6xl text-[#D4C4A0] font-bold mb-4 select-none">
                {s.n}
              </div>
              <div className="w-8 h-px bg-[#C9A84C] mb-4" />
              <h3 className="font-serif text-xl text-[#2D2418] font-semibold mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-[#5C3D1E] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rental Plans
      <section className="bg-[#EDE3CC] py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 font-medium text-center">Rental Plans</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold text-center mb-4">
            Choose your plan
          </h2>
          <p className="text-center text-[#5C3D1E] text-sm mb-16 max-w-lg mx-auto">
            All plans include a complimentary trial session at our Thane atelier.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {rentPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 flex flex-col relative ${
                  plan.highlight ? "bg-[#2D2418] text-[#EDE3CC]" : "bg-[#F5EDD8] text-[#2D2418]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute top-0 right-0 bg-[#C9A84C] text-[#FAF6ED] text-[8px] tracking-[0.3em] uppercase px-3 py-1">
                    {plan.tag}
                  </span>
                )}
                {!plan.highlight && (
                  <span className="text-[8px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2">{plan.tag}</span>
                )}
                <h3 className={`font-serif text-2xl font-semibold mb-1 ${plan.highlight ? "text-[#D4B483]" : ""}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 mb-6">
                  <span className={`font-serif text-4xl font-semibold ${plan.highlight ? "text-[#FAF6ED]" : "text-[#2D2418]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ml-2 ${plan.highlight ? "text-[#C4B49A]" : "text-[#8B6A3E]"}`}>
                    / {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-[#C9A84C]" : "text-[#8B6A3E]"}`}>✦</span>
                      <span className={plan.highlight ? "text-[#C4B49A]" : "text-[#5C3D1E]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`block text-center py-3.5 text-xs tracking-widest uppercase font-medium transition-colors ${
                    plan.highlight
                      ? "bg-[#C9A84C] text-[#FAF6ED] hover:bg-[#B8924A]"
                      : "border border-[#2D2418] text-[#2D2418] hover:bg-[#2D2418] hover:text-[#FAF6ED]"
                  }`}
                >
                  Book This Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Buying Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="aspect-[4/5] overflow-hidden bg-[#EDE3CC]">
          <img
            src="https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=700&h=875&fit=crop&auto=format"
            alt="Exquisite gold bridal lehenga for purchase"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-4 font-medium">
            Own Forever
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold leading-tight mb-6">
            Buy a piece
            <br />
            <em className="italic text-[#8B6A3E]">built to last generations</em>
          </h2>
          <p className="text-[#5C3D1E] leading-relaxed mb-4">
            Our purchase collection features hand-picked pieces from labels like
            Sabyasachi, Manish Malhotra, Anita Dongre, and Tarun Tahiliani —
            each verified for authenticity and craftsmanship.
          </p>
          <p className="text-[#5C3D1E] leading-relaxed mb-8">
            Every purchase includes alteration support, a post-purchase care
            guide, and a heritage preservation bag designed for long-term
            storage.
          </p>
          <ul className="space-y-3 mb-10">
            {[
              "Starting from ₹28,000",
              "Designer label authentication certificate",
              "Complimentary full alteration",
              "Heritage storage bag included",
              "0% interest EMI available",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-[#2D2418]"
              >
                <span className="text-[#C9A84C]">✦</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/collections"
            className="inline-block px-8 py-4 bg-[#2D2418] text-[#FAF6ED] text-xs tracking-widest uppercase font-medium hover:bg-[#5C3D1E] transition-colors"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#EDE3CC] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 font-medium text-center">
            Common Questions
          </p>
          <h2 className="font-serif text-4xl text-[#2D2418] font-semibold text-center mb-12">
            FAQs
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#F5EDD8] border border-[#D4C4A0]">
                <button
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-serif text-base text-[#2D2418] font-medium">
                    {faq.q}
                  </span>
                  <span
                    className={`text-[#C9A84C] flex-shrink-0 transition-transform text-lg ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#5C3D1E] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
