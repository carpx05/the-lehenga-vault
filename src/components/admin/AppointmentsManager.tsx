import { useState, useEffect } from "react"
import {
  Calendar,
  MessageCircle,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import {
  getStoredAppointments,
  updateAppointmentStatus,
  deleteAppointmentRecord,
  type Appointment,
} from "../../lib/appointmentsStorage"
import {
  getEmailConfig,
  saveEmailConfig,
  sendAppointmentEmail,
  type EmailServiceConfig,
} from "../../lib/emailService"
import { WHATSAPP_PHONE } from "../../lib/whatsapp"

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [emailConfig, setEmailConfig] = useState<EmailServiceConfig>(() =>
    getEmailConfig(),
  )
  const [configSaved, setConfigSaved] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    setAppointments(getStoredAppointments())
  }, [])

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    updateAppointmentStatus(id, newStatus)
    setAppointments(getStoredAppointments())
  }

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to remove this appointment record?")
    ) {
      deleteAppointmentRecord(id)
      setAppointments(getStoredAppointments())
    }
  }

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault()
    saveEmailConfig(emailConfig)
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 3000)
  }

  const handleSendTestEmail = async () => {
    setIsTestingEmail(true)
    setTestResult(null)
    const result = await sendAppointmentEmail({
      name: "Atelier Test Client",
      phone: "+91 92849 53320",
      email: "thelehengavault@gmail.com",
      occasion: "Bridal Trial",
      date: new Date().toISOString().split("T")[0],
      interest: "both",
      message:
        "This is a test notification from The Lehenga Vault Admin Dashboard.",
    })
    setIsTestingEmail(false)
    setTestResult(result)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#EDE3CC] border border-[#D4C4A0] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#2D2418]">
              Styling Session Appointments &amp; Leads
            </h2>
            <p className="text-xs text-[#5C3D1E] mt-1">
              Real-time booking requests submitted from the storefront contact
              page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#FAF6ED] border border-[#D4C4A0] text-xs font-semibold text-[#2D2418]">
              {appointments.length} Total Bookings
            </span>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6 shadow-xs">
        <h3 className="font-serif text-lg font-semibold text-[#2D2418] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C9A84C]" />
          <span>Received Requests</span>
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#D4C4A0] bg-[#F5EDD8]/40">
            <Calendar className="w-8 h-8 text-[#C4B49A] mx-auto mb-2" />
            <p className="text-sm text-[#5C3D1E] font-medium">
              No appointments booked yet.
            </p>
            <p className="text-xs text-[#8B6A3E] mt-1">
              When clients submit the appointment form on /contact, their
              details appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D4C4A0] text-[10px] tracking-wider uppercase text-[#8B6A3E] bg-[#EDE3CC]/60">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Occasion &amp; Event</th>
                  <th className="py-3 px-3">Interest</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE3CC]">
                {appointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-[#EDE3CC]/30 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-[#8B6A3E] whitespace-nowrap">
                      {new Date(apt.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#2D2418]">
                      <div>{apt.name}</div>
                      {apt.message && (
                        <p
                          className="text-[11px] text-[#8B6A3E] line-clamp-1 italic max-w-xs mt-0.5"
                          title={apt.message}
                        >
                          "{apt.message}"
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-[#2D2418]">
                        {apt.phone}
                      </div>
                      {apt.email ? (
                        <div
                          className="text-[11px] text-[#5C3D1E] truncate max-w-[160px]"
                          title={apt.email}
                        >
                          {apt.email}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#C4B49A] italic">
                          No email
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-[#2D2418]">
                        {apt.occasion || "Bridal"}
                      </div>
                      <div className="text-[11px] text-[#8B6A3E]">
                        {apt.date || "Date flexible"}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="capitalize px-2 py-0.5 bg-[#EDE3CC] text-[#5C3D1E] text-[10px] font-medium">
                        {apt.interest === "rent"
                          ? "Renting"
                          : apt.interest === "buy"
                            ? "Buying"
                            : "Renting & Buying"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          handleStatusChange(
                            apt.id,
                            e.target.value as Appointment["status"],
                          )
                        }
                        className={`text-[11px] px-2 py-1 font-medium border focus:outline-none ${
                          apt.status === "new"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : apt.status === "contacted"
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : apt.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${apt.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${apt.name}! Thank you for requesting a styling session with The Lehenga Vault. We would love to confirm your private trial slot.`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded shadow-xs"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${apt.phone}`}
                          className="p-1.5 bg-[#2D2418] hover:bg-[#5C3D1E] text-[#FAF6ED] rounded shadow-xs"
                          title="Call Client"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(apt.id)}
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Remove Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Dispatch Configuration Card */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-[#2D2418] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <span>Email Notification Service</span>
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-[#8B6A3E] bg-[#EDE3CC] px-2 py-0.5 font-medium">
            Direct Cloud Dispatch
          </span>
        </div>

        <p className="text-xs text-[#5C3D1E] leading-relaxed mb-6">
          Connect a free email delivery service to receive instantaneous email
          notifications whenever a visitor books an appointment, and optionally
          dispatch confirmation emails directly to the client's inbox.
        </p>

        {!emailConfig.key && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Email Service Not Activated Yet</p>
              <p className="text-[11px] mt-0.5 text-amber-800">
                Incoming leads are safely recorded in the table above, but live
                email dispatch is pending an API Access Key. Follow the
                10-second steps below to activate live emails.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveEmailConfig} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-wider uppercase text-[#8B6A3E] font-semibold mb-1.5">
                Email Provider
              </label>
              <select
                value={emailConfig.provider}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    provider: e.target
                      .value as "web3forms" | "emailjs" | "formspree",
                  })
                }
                className="w-full bg-[#F5EDD8] border border-[#D4C4A0] px-3.5 py-2.5 text-xs text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="web3forms">
                  Web3Forms (Fastest Setup — 10s Free Key)
                </option>
                <option value="emailjs">
                  EmailJS (Dual Delivery — Atelier + Client Auto-Reply)
                </option>
                <option value="formspree">Formspree (Form ID)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] tracking-wider uppercase text-[#8B6A3E] font-semibold mb-1.5">
                {emailConfig.provider === "web3forms"
                  ? "Web3Forms Access Key *"
                  : emailConfig.provider === "emailjs"
                    ? "EmailJS Public Key *"
                    : "Formspree Form ID *"}
              </label>
              <input
                type="text"
                value={emailConfig.key}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, key: e.target.value.trim() })
                }
                placeholder={
                  emailConfig.provider === "web3forms"
                    ? "e.g. 76a8d3e2-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    : emailConfig.provider === "emailjs"
                      ? "e.g. public_key_abc123"
                      : "e.g. mqkvblab"
                }
                className="w-full bg-transparent border border-[#D4C4A0] px-3.5 py-2.5 text-xs text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {emailConfig.provider === "emailjs" && (
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-[#EDE3CC]/40 border border-[#D4C4A0]">
              <div>
                <label className="block text-[10px] tracking-wider uppercase text-[#8B6A3E] font-semibold mb-1.5">
                  EmailJS Service ID *
                </label>
                <input
                  type="text"
                  value={emailConfig.emailjsServiceId || ""}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      emailjsServiceId: e.target.value.trim(),
                    })
                  }
                  placeholder="e.g. service_gmail"
                  className="w-full bg-transparent border border-[#D4C4A0] px-3 py-2 text-xs text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-wider uppercase text-[#8B6A3E] font-semibold mb-1.5">
                  Atelier Template ID *
                </label>
                <input
                  type="text"
                  value={emailConfig.emailjsTemplateId || ""}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      emailjsTemplateId: e.target.value.trim(),
                    })
                  }
                  placeholder="e.g. template_atelier"
                  className="w-full bg-transparent border border-[#D4C4A0] px-3 py-2 text-xs text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-wider uppercase text-[#8B6A3E] font-semibold mb-1.5">
                  Client Confirmation Template ID
                </label>
                <input
                  type="text"
                  value={emailConfig.emailjsCustomerTemplateId || ""}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      emailjsCustomerTemplateId: e.target.value.trim(),
                    })
                  }
                  placeholder="e.g. template_client_confirm"
                  className="w-full bg-transparent border border-[#D4C4A0] px-3 py-2 text-xs text-[#2D2418] placeholder-[#C4B49A] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>
          )}

          {/* Quick Setup Instructions */}
          <div className="bg-[#EDE3CC]/50 border border-[#D4C4A0] p-4 text-xs text-[#5C3D1E] space-y-2">
            <p className="font-semibold text-[#2D2418] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Provider Setup Guide:</span>
            </p>
            {emailConfig.provider === "web3forms" ? (
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#5C3D1E] pl-1 leading-relaxed">
                <li>
                  Visit{" "}
                  <a
                    href="https://web3forms.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#2D2418] font-semibold inline-flex items-center gap-0.5 hover:text-[#C9A84C]"
                  >
                    web3forms.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  Enter <strong>thelehengavault@gmail.com</strong> (or your
                  preferred notification email) and click{" "}
                  <strong>Create Access Key</strong>.
                </li>
                <li>
                  Copy the Access Key sent to your email and paste it in the
                  field above, then click <strong>Save Email Settings</strong>.
                </li>
                <li>
                  Click <strong>Send Test Email</strong> below to verify live
                  inbox delivery!
                </li>
              </ol>
            ) : emailConfig.provider === "emailjs" ? (
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#5C3D1E] pl-1 leading-relaxed">
                <li>
                  Create a free account at{" "}
                  <a
                    href="https://www.emailjs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#2D2418] font-semibold inline-flex items-center gap-0.5 hover:text-[#C9A84C]"
                  >
                    emailjs.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>{" "}
                  (200 free emails/month).
                </li>
                <li>
                  Connect your Email Service (Gmail / Google Workspace for{" "}
                  <strong>thelehengavault@gmail.com</strong>).
                </li>
                <li>
                  Create an <strong>Atelier Notification Template</strong>{" "}
                  sending to thelehengavault@gmail.com.
                </li>
                <li>
                  (Optional) Create a{" "}
                  <strong>Customer Confirmation Template</strong> with To Email:{" "}
                  <code>{"{{to_email}}"}</code> to send confirmation copies
                  directly to the client's inbox!
                </li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#5C3D1E] pl-1 leading-relaxed">
                <li>
                  Visit{" "}
                  <a
                    href="https://formspree.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#2D2418] font-semibold inline-flex items-center gap-0.5 hover:text-[#C9A84C]"
                  >
                    formspree.io <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  Create a free form pointing to{" "}
                  <strong>thelehengavault@gmail.com</strong>.
                </li>
                <li>
                  Copy the Form ID (the letters at the end of the URL) and paste
                  it above.
                </li>
              </ol>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Save Email Settings
            </button>

            <button
              type="button"
              disabled={isTestingEmail || !emailConfig.key}
              onClick={handleSendTestEmail}
              className="px-4 py-2.5 border border-[#2D2418] text-[#2D2418] hover:bg-[#2D2418] hover:text-[#FAF6ED] text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
            >
              {isTestingEmail ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                  <span>Dispatching Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </>
              )}
            </button>

            {configSaved && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings saved!
              </span>
            )}
          </div>

          {testResult && (
            <div
              className={`p-3 border text-xs flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? "Test Succeeded!" : "Test Failed"}
                </p>
                <p className="text-[11px] mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
