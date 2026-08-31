import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#2D2418] text-[#EDE3CC]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl font-semibold text-[#D4B483] mb-2">The Lehenga Vault</p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-5">Bridal · Indo-Western · Luxury</p>
          <p className="text-sm text-[#C4B49A] leading-relaxed max-w-sm">
            Where every bride finds her moment. Curated lehengas for the modern Indian bride — to own or to rent, always in timeless style.
          </p>
          <div className="flex gap-4 mt-6">
            {["Instagram", "Pinterest", "WhatsApp"].map((s) => (
              <a key={s} href="#" className="text-xs tracking-widest uppercase text-[#8B6A3E] hover:text-[#C9A84C] transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#C9A84C] mb-5 font-medium">Navigate</p>
          <ul className="space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/collections", label: "Collections" },
              { to: "/rent-buy", label: "Rent & Buy" },
              { to: "/about", label: "Our Story" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-sm text-[#C4B49A] hover:text-[#D4B483] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#C9A84C] mb-5 font-medium">Visit Us</p>
          <address className="not-italic text-sm text-[#C4B49A] leading-relaxed space-y-1">
            <p>42, Gulmohar Marg</p>
            <p>Banjara Hills, Hyderabad</p>
            <p>Telangana — 500 034</p>
            <p className="mt-4">Mon – Sat, 11am – 8pm</p>
            <p>Sunday by appointment</p>
            <a href="tel:+919876543210" className="block mt-4 hover:text-[#D4B483] transition-colors">
              +91 98765 43210
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-[#5C3D1E] px-6 py-5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs text-[#6B5640]">© 2024 The Lehenga Vault. All rights reserved.</p>
        <p className="text-xs text-[#6B5640]">Crafted with love for the Indian bride.</p>
      </div>
    </footer>
  );
}
