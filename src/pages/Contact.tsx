import { useState } from "react"
import {
  MessageCircle,
  Mail,
  CheckCircle2,
  Sparkles,
  Phone,
  RotateCcw,
  Send,
  AlertCircle,
} from "lucide-react"
import { buildWhatsAppAppointmentUrl, WHATSAPP_PHONE } from "../lib/whatsapp"
import {
  validateEmailSyntax,
  verifyEmailDomainMX,
  type EmailValidationResult,
} from "../lib/emailValidator"
import { saveAppointmentRecord } from "../lib/appointmentsStorage"
import { sendAppointmentEmail } from "../lib/emailService"

const occasions = [
  "Bridal",
  "Reception",
  "Mehendi / Sangeet",
  "Festive / Function",
  "Indo-Western",
  "Other",
]

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "",
    date: "",
    interest: "rent",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] =
    useState<"idle" | "sending" | "sent" | "failed">("idle")
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>(
    {
      isValid: true,
      status: "idle",
    },
  )

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === "email" && emailValidation.status !== "idle") {
      setEmailValidation({ isValid: true, status: "idle" })
    }
  }

  const checkEmail = async (emailValue: string): Promise<boolean> => {
    const trimmed = emailValue.trim()
    // Email is optional: if empty, clear any status and allow submission
    if (!trimmed) {
      setEmailValidation({
        isValid: true,
        status: "idle",
      })
      return true
    }

    const syntax = validateEmailSyntax(trimmed)
    if (!syntax.isValid) {
      setEmailValidation({
        isValid: false,
        error: syntax.error,
        status: "invalid",
      })
      return false
    }

    if (syntax.suggestion) {
      setEmailValidation({
        isValid: true,
        suggestion: syntax.suggestion,
        status: "suggest",
      })
      return true
    }

    setEmailValidation({
      isValid: true,
      status: "checking",
    })

    const mxResult = await verifyEmailDomainMX(trimmed)
    if (!mxResult.isValid) {
      setEmailValidation({
        isValid: false,
        error: mxResult.error,
        status: "invalid",
      })
      return false
    }

    setEmailValidation({
      isValid: true,
      status: "valid",
    })
    return true
  }

  const applyEmailSuggestion = (suggestedEmail: string) => {
    setForm((prev) => ({ ...prev, email: suggestedEmail }))
    setEmailValidation({
      isValid: true,
      status: "valid",
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Please provide at least your Name and Phone Number.")
      return
    }

    const trimmedEmail = form.email.trim()

    // If an email address is provided, verify it before sending
    if (trimmedEmail) {
      if (emailValidation.status === "invalid") {
        return
      }

      if (
        emailValidation.status !== "valid" &&
        emailValidation.status !== "suggest"
      ) {
        const isValid = await checkEmail(trimmedEmail)
        if (!isValid) {
          return
        }
      }
    }

    setIsSubmitting(true)
    setEmailStatus("sending")

    // 1. Immediately record the appointment in local & cloud persistence so zero leads are lost
    saveAppointmentRecord({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: trimmedEmail,
      occasion: form.occasion,
      date: form.date,
      interest: form.interest,
      message: form.message.trim(),
    })

    // 2. WhatsApp Dispatch: Generate deep link and attempt auto-open (clean ASCII, zero emojis)
    const waUrl = buildWhatsAppAppointmentUrl(form)
    try {
      window.open(waUrl, "_blank")
    } catch {
      // Pop-up blocker fallback - user can click the button on the confirmation screen
    }

    // 3. Email Dispatch via Configured Service (Web3Forms / Formspree)
    try {
      const emailResult = await sendAppointmentEmail({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: trimmedEmail,
        occasion: form.occasion,
        date: form.date,
        interest: form.interest,
        message: form.message.trim(),
      })
      if (emailResult.success) {
        setEmailStatus("sent")
      } else {
        setEmailStatus("failed")
      }
    } catch (err) {
      console.warn("Email dispatch notice:", err)
      setEmailStatus("failed")
    } finally {
      setIsSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="bg-[#F5EDD8] min-h-screen">
      {/* Header */}
      <div className="bg-[#EDE3CC] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B6A3E] mb-3 font-medium">
            Visit or write to us
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#2D2418] font-semibold">
            Let's find your
            <br />
            <em className="italic text-[#8B6A3E]">perfect lehenga.</em>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-5 gap-12 md:gap-16">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">
              Our Atelier
            </p>
            <address className="not-italic space-y-1 text-sm text-[#2D2418] leading-relaxed">
              <p className="font-serif text-lg font-semibold text-[#2D2418] mb-2">
                The Lehenga Vault
              </p>
              <p>Shop no 15, Morning Glory, Tropical Lagoon </p>
              <p>Anand Nagar, Thane West, Thane </p>
              <p> Maharashtra - 400615</p>
            </address>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">
              Hours
            </p>
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
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">
              Reach Us
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="tel:+919284953320"
                className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors"
              >
                <span className="text-[#C9A84C]">✦</span> +91 92849 53320
              </a>
              <a
                href="mailto:thelehengavault@gmail.com"
                className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors"
              >
                <span className="text-[#C9A84C]">✦</span>{" "}
                thelehengavault@gmail.com
              </a>
              <a
                href="https://wa.me/919284953320"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#2D2418] hover:text-[#C9A84C] transition-colors"
              >
                <span className="text-[#C9A84C]">✦</span> WhatsApp: +91 92849
                53320
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-4 font-medium">
              Follow
            </p>
            <div className="flex gap-4">
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/thelehengas1vault/",
                },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
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
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] mb-6 font-medium">
            Book a Styling Session
          </p>

          {submitted ? (
            <div className="bg-[#EDE3CC]/60 border border-[#C9A84C]/60 p-8 sm:p-12 text-center shadow-lg relative animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 bg-[#2D2418] text-[#C9A84C] border border-[#C9A84C] rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>

              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-semibold block mb-1">
                Appointment Request Received
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2418] font-semibold mb-3">
                Thank you, {form.name.split(" ")[0]}.
              </h2>
              <p className="text-[#5C3D1E] leading-relaxed text-sm max-w-md mx-auto mb-8">
                Your styling session details have been prepared for our Thane
                atelier team. We look forward to hosting you!
              </p>

              {/* Request Summary Strip */}
              <div className="max-w-md mx-auto bg-[#FAF6ED]/70 border border-[#D4C4A0]/60 p-4 mb-8 text-left text-xs grid grid-cols-2 gap-3 text-[#5C3D1E] shadow-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#8B6A3E] block">
                    Occasion
                  </span>
                  <span className="font-medium text-[#2D2418]">
                    {form.occasion || "Bridal"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8B6A3E] block">
                    Event Date
                  </span>
                  <span className="font-medium text-[#2D2418]">
                    {form.date || "Flexible / TBD"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8B6A3E] block">
                    Phone
                  </span>
                  <span className="font-medium text-[#2D2418]">
                    {form.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8B6A3E] block">
                    Interest
                  </span>
                  <span className="font-medium text-[#2D2418]">
                    {form.interest === "rent"
                      ? "Renting"
                      : form.interest === "buy"
                        ? "Buying"
                        : "Renting & Buying"}
                  </span>
                </div>
                {form.email ? (
                  <div className="col-span-2 pt-2 border-t border-[#EDE3CC]">
                    <span className="text-[10px] uppercase text-[#8B6A3E] block">
                      Email
                    </span>
                    <span
                      className="font-medium text-[#2D2418] truncate block"
                      title={form.email}
                    >
                      {form.email}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Conversion Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <a
                  href={buildWhatsAppAppointmentUrl(form)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp Now
                </a>
                <a
                  href={`tel:+91${WHATSAPP_PHONE}`}
                  className="w-full sm:w-auto py-4 px-5 border border-[#2D2418] text-[#2D2418] hover:bg-[#2D2418] hover:text-[#FAF6ED] text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Call Atelier
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-[#D4C4A0]/60 flex items-center justify-between flex-wrap gap-3 text-xs text-[#8B6A3E]">
                <span>The Lehenga Vault · Thane West</span>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setForm({
                      name: "",
                      phone: "",
                      email: "",
                      occasion: "",
                      date: "",
                      interest: "rent",
                      message: "",
                    })
                  }}
                  className="inline-flex items-center gap-1 hover:text-[#2D2418] underline transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Book another session
                </button>
              </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-medium">
                    Email Address{" "}
                    <span className="text-[#8B6A3E]/60 text-[9px] lowercase tracking-normal font-normal">
                      (optional)
                    </span>
                  </label>
                  {emailValidation.status === "checking" && (
                    <span className="text-[10px] text-[#8B6A3E] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin text-[#C9A84C]" />
                      Verifying mailbox domain...
                    </span>
                  )}
                  {emailValidation.status === "valid" && form.email.trim() && (
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Domain verified
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handle}
                    onBlur={(e) => checkEmail(e.target.value)}
                    placeholder="priya@gmail.com"
                    className={`w-full bg-transparent border px-4 py-3 pr-10 text-sm text-[#2D2418] placeholder-[#C4B49A] focus:outline-none transition-colors ${
                      emailValidation.status === "invalid"
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : emailValidation.status === "valid" &&
                            form.email.trim()
                          ? "border-emerald-600/60 focus:border-emerald-600"
                          : "border-[#D4C4A0] focus:border-[#C9A84C]"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B6A3E]">
                    {emailValidation.status === "checking" ? (
                      <Sparkles className="w-4 h-4 animate-spin text-[#C9A84C]" />
                    ) : emailValidation.status === "valid" &&
                      form.email.trim() ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : emailValidation.status === "invalid" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#8B6A3E]/50" />
                    )}
                  </div>
                </div>

                {/* Typo Auto-Suggestion Pill */}
                {emailValidation.suggestion && (
                  <div className="mt-2 p-2.5 bg-[#FAF6ED] border border-[#C9A84C]/50 flex items-center justify-between text-xs animate-in fade-in">
                    <span className="text-[#5C3D1E]">
                      Did you mean{" "}
                      <strong className="text-[#2D2418] underline font-semibold">
                        {emailValidation.suggestion}
                      </strong>
                      ?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        applyEmailSuggestion(emailValidation.suggestion!)
                      }
                      className="px-2.5 py-1 bg-[#2D2418] text-[#FAF6ED] text-[10px] tracking-wider uppercase font-semibold hover:bg-[#C9A84C] hover:text-[#2D2418] transition-colors cursor-pointer"
                    >
                      Use Suggestion
                    </button>
                  </div>
                )}

                {/* Validation Error Banner */}
                {emailValidation.status === "invalid" &&
                  emailValidation.error && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{emailValidation.error}</span>
                    </p>
                  )}

                <p className="mt-1.5 text-[10px] text-[#8B6A3E]">
                  Optional: If provided, a copy of your appointment summary will
                  be sent to your inbox.
                </p>
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
                      <option key={o} value={o}>
                        {o}
                      </option>
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
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="interest"
                        value={opt.value}
                        checked={form.interest === opt.value}
                        onChange={handle}
                        className="accent-[#C9A84C]"
                      />
                      <span className="text-sm text-[#2D2418]">
                        {opt.label}
                      </span>
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
                disabled={isSubmitting}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-sm tracking-widest uppercase font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-[#FAF6ED]" />
                    <span>Preparing Your Session...</span>
                  </>
                ) : (
                  <>
                    <span>Request Appointment</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              <div className="space-y-1 text-center">
                <p className="text-[11px] text-[#5C3D1E] font-medium flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                  <span>
                    Instant notification sent to atelier via WhatsApp &amp;
                    Email.
                  </span>
                </p>
                <p className="text-[10px] text-[#8B6A3E]">
                  We will reach out within 24 hours to confirm your trial slot.
                  Appointments are always complimentary.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
