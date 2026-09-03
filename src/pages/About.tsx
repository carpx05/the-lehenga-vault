import { Link } from "react-router-dom"

const values = [
  {
    title: "Curation over quantity",
    body: "Every piece in our vault passes through four rounds of review — fabric quality, construction, design integrity, and cultural authenticity. We say no to 90% of what we see.",
  },
  {
    title: "Accessible luxury",
    body: "A designer lehenga shouldn't require choosing between your dream outfit and a honeymoon. Renting from us means wearing ₹1 lakh pieces for a fraction of the cost.",
  },
  {
    title: "Conscious fashion",
    body: "By enabling rental, we extend the life of couture pieces and reduce the waste of single-wear fashion — one lehenga, many celebrations.",
  },
  {
    title: "The human touch",
    body: "Every appointment is led by a dedicated stylist. We do not believe in a 'rack and browse' experience — our job is to understand your story and find the outfit that tells it.",
  },
]

const team = [
  {
    name: "Kavya Nair",
    role: "Founder & Head Stylist",
    note: "Former fashion editor. 12 years in Indian couture.",
    img: "https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Aisha Qureshi",
    role: "Bridal Styling Lead",
    note: "Styled 200+ brides across Thane, Mumbai & Delhi.",
    img: "https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Rohan Mehta",
    role: "Curation & Designer Relations",
    note: "Direct relationships with 30+ Indian designer labels.",
    img: "https://images.unsplash.com/photo-1610048869310-d889ff25c374?w=400&h=400&fit=crop&auto=format",
  },
]

export default function About() {
  return (
    <div className="bg-[#F5EDD8] min-h-screen">
      {/* Header */}
      <div className="relative bg-[#2D2418] pt-32 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-end pb-0">
          <div className="pb-16 md:pb-24">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#C9A84C] mb-4 font-medium">
              Our Story
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#EDE3CC] font-semibold leading-tight">
              Built from a love
              <br />
              of the <em className="italic text-[#D4B483]">Indian bride.</em>
            </h1>
          </div>
          <div className="relative h-72 md:h-96">
            <img
              src="https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=700&h=600&fit=crop&auto=format"
              alt="Bride in a stunning red and gold bridal lehenga"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <div className="w-8 h-px bg-[#C9A84C] mb-4" />
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B6A3E] font-medium">
            Founded 2019
          </p>
        </div>
        <div className="md:col-span-9 space-y-6">
          <p className="font-serif text-2xl md:text-3xl text-[#2D2418] leading-relaxed font-medium">
            "I watched my sister spend three weekends in bridal stores,
            overwhelmed by options that felt either too generic or entirely out
            of budget. That weekend, I decided to build something different."
          </p>
          <p className="text-[#5C3D1E] leading-relaxed">
            — Kavya Nair, Founder of The Lehenga Vault
          </p>
          <p className="text-[#5C3D1E] leading-relaxed mt-6">
            The Lehenga Vault was founded in 2019 in Thane with a simple idea:
            what if every bride — regardless of budget — could wear a truly
            spectacular lehenga on her wedding day? What began as a small
            curated rack of 40 pieces in a boutique studio grew into Thane's
            most trusted bridal and Indo-Western rental and retail destination.
          </p>
          <p className="text-[#5C3D1E] leading-relaxed">
            Today, our vault houses over 500 pieces from India's finest
            designers, and our team of stylists has helped more than 200 brides
            find the one. We work equally with women who are buying their dream
            piece and those who want to rent a couture look without the couture
            price tag.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#EDE3CC] py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 font-medium">
            What we believe
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold mb-16">
            Our values
          </h2>
          <div className="grid md:grid-cols-2 gap-px bg-[#D4C4A0]">
            {values.map((v) => (
              <div key={v.title} className="bg-[#EDE3CC] p-10 md:p-12">
                <div className="w-6 h-px bg-[#C9A84C] mb-5" />
                <h3 className="font-serif text-2xl text-[#2D2418] font-semibold mb-4">
                  {v.title}
                </h3>
                <p className="text-sm text-[#5C3D1E] leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B6A3E] mb-3 font-medium">
          The people behind the vault
        </p>
        <h2 className="font-serif text-4xl md:text-5xl text-[#2D2418] font-semibold mb-16">
          Meet the team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="group">
              <div className="aspect-square overflow-hidden bg-[#EDE3CC] mb-5">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="w-5 h-px bg-[#C9A84C] mb-3" />
              <p className="font-serif text-xl text-[#2D2418] font-semibold">
                {member.name}
              </p>
              <p className="text-xs tracking-widest uppercase text-[#C9A84C] mt-1 font-medium">
                {member.role}
              </p>
              <p className="text-sm text-[#5C3D1E] mt-3 leading-relaxed">
                {member.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Press */}
      <section className="bg-[#2D2418] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9A84C] mb-8 text-center font-medium">
            As seen in
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 items-center">
            {[
              "Vogue India",
              "Harper's Bazaar",
              "Femina",
              "WeddingWire",
              "The Hindu",
            ].map((pub) => (
              <p
                key={pub}
                className="font-serif text-xl text-[#5C3D1E] hover:text-[#D4B483] transition-colors cursor-default"
              >
                {pub}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center bg-[#F5EDD8]">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B6A3E] mb-4 font-medium">
          Come see us
        </p>
        <h2 className="font-serif text-4xl text-[#2D2418] font-semibold mb-4">
          The vault is open.
        </h2>
        <p className="text-[#5C3D1E] text-sm mb-8 max-w-md mx-auto leading-relaxed">
          We invite you to experience The Lehenga Vault in person. Book a
          private styling appointment — it's always free, always personal.
        </p>
        <Link
          to="/contact"
          className="inline-block px-10 py-4 bg-[#C9A84C] text-[#FAF6ED] text-xs tracking-widest uppercase font-medium hover:bg-[#B8924A] transition-colors"
        >
          Book Your Visit
        </Link>
      </section>
    </div>
  )
}
