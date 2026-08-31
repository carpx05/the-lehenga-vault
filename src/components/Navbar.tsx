import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/rent-buy", label: "Rent & Buy" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5EDD8]/90 backdrop-blur-sm border-b border-[#D4C4A0]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-serif text-xl md:text-2xl font-semibold text-[#2D2418] tracking-wide">The Lehenga Vault</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-light">Bridal · Indo-Western · Luxury</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm tracking-wider uppercase font-medium transition-colors duration-200 ${
                pathname === to
                  ? "text-[#C9A84C]"
                  : "text-[#2D2418] hover:text-[#C9A84C]"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-4 px-5 py-2 bg-[#C9A84C] text-[#FAF6ED] text-sm tracking-wider uppercase font-medium hover:bg-[#B8924A] transition-colors duration-200"
          >
            Book Appointment
          </Link>
        </nav>

        <button
          className="md:hidden text-[#2D2418] p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block w-6 h-px bg-current transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-px bg-current transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-current transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#F5EDD8] border-t border-[#D4C4A0] px-6 py-4 flex flex-col gap-4">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`text-sm tracking-widest uppercase font-medium py-2 ${
                pathname === to ? "text-[#C9A84C]" : "text-[#2D2418]"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 px-5 py-3 bg-[#C9A84C] text-center text-[#FAF6ED] text-sm tracking-wider uppercase font-medium"
          >
            Book Appointment
          </Link>
        </div>
      )}
    </header>
  );
}
