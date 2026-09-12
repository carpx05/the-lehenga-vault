/**
 * Reliable Multi-Provider Email Dispatch Service
 * Bypasses Cloudflare bot-challenges by using verified developer APIs (Web3Forms & Formspree)
 * with full CORS support and zero iframe restrictions.
 */

export interface EmailServiceConfig {
  provider: "web3forms" | "emailjs" | "formspree"
  key: string // Web3Forms Access Key, EmailJS Public Key, or Formspree Form ID
  emailjsServiceId?: string
  emailjsTemplateId?: string // Template for notifying the atelier
  emailjsCustomerTemplateId?: string // Template for sending confirmation directly to customer
}

const STORAGE_KEY = "lehenga_email_dispatch_config_v1"

// Default configuration with optional environment variables
export function getEmailConfig(): EmailServiceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }

  const envKey =
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_WEB3FORMS_KEY || ""

  return {
    provider: "web3forms",
    key: envKey || "",
  }
}

export function saveEmailConfig(config: EmailServiceConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn("Failed to save email config:", err)
  }
}

export interface SendAppointmentEmailParams {
  name: string
  phone: string
  email?: string
  occasion?: string
  date?: string
  interest?: string
  message?: string
}

export async function sendAppointmentEmail(
  data: SendAppointmentEmailParams,
): Promise<{ success: boolean message: string customerEmailSent?: boolean }> {
  const config = getEmailConfig()

  if (!config.key) {
    return {
      success: false,
      message:
        "No email service key configured. Please enter your free Web3Forms Access Key or EmailJS configuration in Admin settings.",
    }
  }

  const subject = `New Styling Session Request: ${data.name} (${data.occasion || "Bridal"})`
  const interestLabel =
    data.interest === "rent"
      ? "Renting"
      : data.interest === "buy"
        ? "Buying"
        : "Both Renting & Buying"

  const content = `New appointment request received from The Lehenga Vault website:

- Client Name: ${data.name}
- Phone Number: ${data.phone}
- Email Address: ${data.email?.trim() || "Not provided"}
- Occasion: ${data.occasion || "Not specified"}
- Event Date: ${data.date || "Not specified"}
- Interested In: ${interestLabel}
- Styling Notes: ${data.message?.trim() || "None"}
- Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
`

  try {
    // 1. Web3Forms Dispatch
    if (config.provider === "web3forms") {
      const payload: Record<string, unknown> = {
        access_key: config.key,
        subject,
        from_name: "The Lehenga Vault Booking",
        name: data.name,
        phone: data.phone,
        email: data.email?.trim() || "thelehengavault@gmail.com",
        occasion: data.occasion || "Not specified",
        event_date: data.date || "Not specified",
        interest: interestLabel,
        message: content,
      }

      if (data.email?.trim()) {
        payload.replyto = data.email.trim()
      }

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        return {
          success: true,
          message:
            "Email sent successfully to thelehengavault@gmail.com via Web3Forms.",
        }
      }
      return {
        success: false,
        message: json.message || "Web3Forms submission was not successful.",
      }
    }

    // 2. EmailJS Dispatch (Supports sending to Atelier AND sending Customer Confirmation)
    if (config.provider === "emailjs") {
      if (!config.emailjsServiceId || !config.emailjsTemplateId) {
        return {
          success: false,
          message:
            "EmailJS Service ID and Atelier Template ID must be configured in Admin settings.",
        }
      }

      // Step A: Send notification to the atelier
      const atelierPayload = {
        service_id: config.emailjsServiceId,
        template_id: config.emailjsTemplateId,
        user_id: config.key,
        template_params: {
          to_email: "thelehengavault@gmail.com",
          client_name: data.name,
          client_phone: data.phone,
          client_email: data.email?.trim() || "Not provided",
          occasion: data.occasion || "Bridal",
          event_date: data.date || "Flexible",
          interest: interestLabel,
          notes: data.message?.trim() || "None",
          subject,
          message: content,
        },
      }

      const atelierRes = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(atelierPayload),
        },
      )

      if (!atelierRes.ok) {
        const errorText = await atelierRes.text()
        return {
          success: false,
          message: `EmailJS failed to notify atelier: ${errorText}`,
        }
      }

      let customerSent = false
      // Step B: Send confirmation copy directly to client if email provided and template set
      if (data.email?.trim() && config.emailjsCustomerTemplateId) {
        try {
          const clientPayload = {
            service_id: config.emailjsServiceId,
            template_id: config.emailjsCustomerTemplateId,
            user_id: config.key,
            template_params: {
              to_email: data.email.trim(),
              client_name: data.name,
              occasion: data.occasion || "Bridal",
              event_date: data.date || "Flexible",
              interest: interestLabel,
              notes: data.message?.trim() || "",
            },
          }

          const clientRes = await fetch(
            "https://api.emailjs.com/api/v1.0/email/send",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(clientPayload),
            },
          )
          customerSent = clientRes.ok
        } catch (clientErr) {
          console.warn("EmailJS customer auto-reply notice:", clientErr)
        }
      }

      return {
        success: true,
        message: customerSent
          ? "Notification dispatched to atelier and confirmation copy sent to client."
          : "Notification dispatched to atelier via EmailJS.",
        customerEmailSent: customerSent,
      }
    }

    // 3. Formspree Dispatch
    if (config.provider === "formspree") {
      const endpoint = config.key.startsWith("http")
        ? config.key
        : `https://formspree.io/f/${config.key}`

      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email?.trim() || "Not provided",
        _replyto: data.email?.trim() || undefined,
        _subject: subject,
        occasion: data.occasion || "Not specified",
        event_date: data.date || "Not specified",
        interest: interestLabel,
        message: data.message?.trim() || "None",
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok) {
        return {
          success: true,
          message: "Email sent successfully via Formspree.",
        }
      }
      return {
        success: false,
        message: json.error || "Formspree submission was not successful.",
      }
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Network error during email dispatch"
    return { success: false, message: errorMsg }
  }

  return { success: false, message: "Unknown email provider." }
}
