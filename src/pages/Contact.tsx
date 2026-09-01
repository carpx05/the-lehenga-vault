import { useState } from "react";

const occasions = ["Bridal", "Reception", "Mehendi / Sangeet", "Festive / Function", "Indo-Western", "Other"];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "",
    date: "",
    interest: "rent",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F5EDD8] min-h-screen">
      {/* Header */}
      <div className="bg-[#EDE3CC] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B6A3E] mb-3 font-medium">Visit or write to us</p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#2D2418] font-semibold">
            Let's find your<br />
            <em className="italic text-[#8B6A3E]">perfect lehenga.</em>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-5 gap-12 md:gap-16">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">Our Atelier</p>
            <address className="not-italic space-y-1 text-sm text-[#2D2418] leading-relaxed">
              <p className="font-serif text-lg font-semibold text-[#2D2418] mb-2">The Lehenga Vault</p>
              <p>Shop no 15, Morning Glory, Tropical Lagoon </p>
              <p>Anand Nagar, Thane West, Thane </p>
              <p> Maharashtra - 400615</p>
            </address>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">Hours</p>
            <div className="space-y-1 text-sm text-[#2D2418]">
              <div className="flex justify-between">
                <span>Monday - Saturday</span>
                <span className="text-[#8B6A3E]">11am – 8pm</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-[#8B6A3E]">By appointment</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">Reach Us</p>
            <div className="space-y-2 text-sm">
              <a href="tel:+919284953320" className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors">
                <span className="text-[#C9A84C]">✦</span> +91 92849 53320
              </a>
              <a href="mailto:thelehengavault@gmail.com" className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors">
                <span className="text-[#C9A84C]">✦</span> thelehengavault@gmail.com
              </a>
              <a
                href="https://wa.me/919284953320"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors"
              >
                <span className="text-[#C9A84C]">✦</span> WhatsApp: +91 92849 53320
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">Follow</p>
            <div className="flex gap-4">
              {[
                { label: "Instagram", href: "https://www.instagram.com/thelehengas1vault/" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-xs tracking-widest uppercase text-[#5C3D1E] hover:text-[#C9A84C] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="aspect-video bg-[#EDE3CC] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=600&h=400&fit=crop&auto=format"
              alt="The Lehenga Vault atelier interior"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-6 font-medium">Book a Styling Session</p>

          {submitted ? (
            <div className="bg-[#EDE3CC] p-12 text-center">
              <div className="w-12 h-12 bg-[#C9A84C] mx-auto mb-6 flex items-center justify-center">
                <span className="text-[#FAF6ED] text-xl">✦</span>
              </div>
              <h2 className="font-serif text-3xl text-[#2D2418] font-semibold mb-3">Thank you, {form.name.split(" ")[0]}.</h2>
              <p className="text-[#5C3D1E] leading-relaxed text-sm max-w-sm mx-auto">
                Your appointment request has been received. Our team will reach out within 24 hours to confirm your styling session.
              </p>
              <p className="text-xs text-[#8B6A3E] mt-8 tracking-wider">The Lehenga Vault · Hyderabad</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handle}
                    placeholder="Priya Sharma"
                    className="w-full bg-transparent border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handle}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="priya@email.com"
                  className="w-full bg-transparent border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                    Occasion *
                  </label>
                  <select
                    required
                    name="occasion"
                    value={form.occasion}
                    onChange={handle}
                    className="w-full bg-[#F5EDD8] border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                  >
                    <option value="">Select occasion</option>
                    {occasions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handle}
                    className="w-full bg-transparent border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-3 font-medium">
                  I'm interested in *
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "rent", label: "Renting" },
                    { value: "buy", label: "Buying" },
                    { value: "both", label: "Both" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interest"
                        value={opt.value}
                        checked={form.interest === opt.value}
                        onChange={handle}
                        className="accent-[#C9A84C]"
                      />
                      <span className="text-sm text-[#2D2418]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] mb-2 font-medium">
                  Tell us more
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handle}
                  rows={4}
                  placeholder="Share your dream look, color preferences, budget range, or any questions..."
                  className="w-full bg-transparent border border-[#D4C4A0] px-4 py-3 text-sm text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#C9A84C] text-[#FAF6ED] text-sm tracking-widest uppercase font-medium hover:bg-[#B8924A] transition-colors"
              >
                Request Appointment
              </button>
              <p className="text-xs text-[#8B6A3E] text-center">
                We'll reach out within 24 hours to confirm your session. Appointments are always complimentary.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
