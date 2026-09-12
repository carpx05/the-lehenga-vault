/**
 * Email Validation & Real-Time Mailbox Domain Verification
 *
 * 1. Validates standard RFC 5322 syntax and format.
 * 2. Detects common typos in popular providers (e.g. gmai.com -> gmail.com) with auto-suggestions.
 * 3. Detects disposable / burner temporary email domains.
 * 4. Verifies domain MX records via Google DNS-over-HTTPS (DoH) to ensure the mail server exists and receives emails.
 */

const COMMON_TYPOS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "ymail.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "icoud.com": "icloud.com",
  "redifmail.com": "rediffmail.com",
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "sharklasers.com",
  "getairmail.com",
  "temp-mail.org",
  "fakemailgenerator.com",
])

export interface EmailValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
  status: "idle" | "checking" | "valid" | "invalid" | "suggest"
}

export function validateEmailSyntax(
  email: string,
): {
  isValid: boolean
  error?: string
  suggestion?: string
} {
  const trimmed = email.trim()
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." }
  }

  // Standard RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid email format (e.g. name@example.com).",
    }
  }

  const [localPart, domain] = trimmed.toLowerCase().split("@")

  // Check for common typo suggestions
  if (COMMON_TYPOS[domain]) {
    const suggestedDomain = COMMON_TYPOS[domain]
    return {
      isValid: true,
      suggestion: `${localPart}@${suggestedDomain}`,
    }
  }

  // Check for disposable email providers
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error:
        "Disposable / temporary email addresses are not accepted. Please use your personal or business email.",
    }
  }

  return { isValid: true }
}

/**
 * Real-time DNS MX Lookup via Google DNS-over-HTTPS
 * Verifies that the domain exists and possesses active Mail Exchanger (MX) records.
 */
export async function verifyEmailDomainMX(
  email: string,
): Promise<{
  isValid: boolean
  error?: string
  status: "valid" | "invalid" | "unverified"
}> {
  const trimmed = email.trim().toLowerCase()
  const syntaxCheck = validateEmailSyntax(trimmed)
  if (!syntaxCheck.isValid) {
    return { isValid: false, error: syntaxCheck.error, status: "invalid" }
  }

  const domain = trimmed.split("@")[1]

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: controller.signal },
    )
    clearTimeout(timeoutId)

    if (!res.ok) {
      return { isValid: true, status: "unverified" }
    }

    const data = await res.json()

    // Status 3 is NXDOMAIN (Domain does not exist)
    if (data.Status === 3) {
      return {
        isValid: false,
        error: `Domain "${domain}" does not exist. Please check for typos.`,
        status: "invalid",
      }
    }

    // Status 0 is NOERROR (Domain exists)
    if (data.Status === 0) {
      // Check Answer array for MX records
      if (data.Answer && data.Answer.length > 0) {
        // RFC 7505 Null MX check ("0 .")
        const isNullMx = data.Answer.some(
          (ans: { data?: string }) => ans.data === "0 .",
        )
        if (isNullMx) {
          return {
            isValid: false,
            error: `Domain "${domain}" is configured to not accept incoming mail.`,
            status: "invalid",
          }
        }
        return { isValid: true, status: "valid" }
      }

      // If no MX records found, check for fallback A record (RFC 5321 implicit MX)
      const resA = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      )
      if (resA.ok) {
        const dataA = await resA.json()
        if (dataA.Status === 0 && dataA.Answer && dataA.Answer.length > 0) {
          return { isValid: true, status: "valid" }
        }
      }

      return {
        isValid: false,
        error: `Domain "${domain}" does not have active mail servers configured to receive emails.`,
        status: "invalid",
      }
    }

    return { isValid: true, status: "unverified" }
  } catch {
    // If DNS query fails or times out, fallback to allow the user to proceed
    return { isValid: true, status: "unverified" }
  }
}
