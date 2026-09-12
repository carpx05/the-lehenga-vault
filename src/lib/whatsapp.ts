import { getPricingDetails } from "./pricing"

export const WHATSAPP_PHONE = "919284953320"

export interface WhatsAppPiece {
  title: string
  designer?: string
  tag?: string
  price?: string
  buy_price?: string
  current_price?: string
  rent?: string
  sku?: string
  available?: boolean
}

/**
 * Builds a direct WhatsApp chat link with a customized pre-filled message
 * detailing the specific lehenga piece, collection, designer, and pricing.
 */
export function buildWhatsAppEnquiryUrl(
  piece: WhatsAppPiece,
  intent?: "general" | "rent" | "buy",
): string {
  const isAvailable = piece.available !== false
  const pricing = getPricingDetails(piece)
  const priceDisplay = pricing.hasDiscount
    ? `${pricing.currentPrice} (Limited Time Discount — Original Price: ${pricing.buyPrice})`
    : pricing.currentPrice
  const lines: string[] = []

  if (!isAvailable) {
    lines.push("Hello The Lehenga Vault!")
    lines.push("")
    lines.push(
      "I would like to join the waitlist / enquire for when this piece is next available:",
    )
    lines.push(`- *Piece:* ${piece.title}`)
    if (piece.designer) lines.push(`- *Designer:* ${piece.designer}`)
    if (piece.tag) lines.push(`- *Collection:* ${piece.tag}`)
    if (piece.sku) lines.push(`- *SKU:* ${piece.sku}`)
    lines.push("")
    lines.push(
      "Could you please notify me when it becomes available for trial or booking?",
    )
    lines.push("Thank you!")
  } else if (intent === "rent") {
    lines.push("Hello The Lehenga Vault!")
    lines.push("")
    lines.push(
      "I would like to enquire about *RENTING* this piece from your collection:",
    )
    lines.push(`- *Piece:* ${piece.title}`)
    if (piece.designer) lines.push(`- *Designer:* ${piece.designer}`)
    if (piece.tag) lines.push(`- *Collection:* ${piece.tag}`)
    if (piece.rent) lines.push(`- *Rental Price:* ${piece.rent}`)
    if (piece.sku) lines.push(`- *SKU:* ${piece.sku}`)
    lines.push("")
    lines.push(
      "Could you please share available dates and private trial booking slots?",
    )
    lines.push("Thank you!")
  } else if (intent === "buy") {
    lines.push("Hello The Lehenga Vault!")
    lines.push("")
    lines.push(
      "I would like to enquire about *PURCHASING* this piece from your collection:",
    )
    lines.push(`- *Piece:* ${piece.title}`)
    if (piece.designer) lines.push(`- *Designer:* ${piece.designer}`)
    if (piece.tag) lines.push(`- *Collection:* ${piece.tag}`)
    if (priceDisplay) lines.push(`- *Purchase Price:* ${priceDisplay}`)
    if (piece.sku) lines.push(`- *SKU:* ${piece.sku}`)
    lines.push("")
    lines.push(
      "Could you please share details on sizing, alterations, and purchasing?",
    )
    lines.push("Thank you!")
  } else {
    // Default Book / Enquire message
    lines.push("Hello The Lehenga Vault!")
    lines.push("")
    lines.push(
      "I would like to book a private trial / enquire about this piece from your collection:",
    )
    lines.push(`- *Piece:* ${piece.title}`)
    if (piece.designer) lines.push(`- *Designer:* ${piece.designer}`)
    if (piece.tag) lines.push(`- *Collection:* ${piece.tag}`)
    if (priceDisplay) lines.push(`- *Buy Price:* ${priceDisplay}`)
    if (piece.rent) lines.push(`- *Rental:* ${piece.rent}`)
    if (piece.sku) lines.push(`- *SKU:* ${piece.sku}`)
    lines.push("")
    lines.push(
      "Could you please share availability and appointment slots at your Thane atelier?",
    )
    lines.push("Thank you!")
  }

  const message = lines.join("\n")
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export interface AppointmentRequest {
  name: string
  phone: string
  email?: string
  occasion?: string
  date?: string
  interest?: string
  message?: string
}

/**
 * Builds a direct WhatsApp chat link to notify the store owner of a new styling session appointment request.
 */
export function buildWhatsAppAppointmentUrl(data: AppointmentRequest): string {
  const lines: string[] = []
  lines.push("Hello The Lehenga Vault!")
  lines.push("")
  lines.push(
    "I would like to book a *Private Styling Session* at your Thane atelier:",
  )
  lines.push(`- *Client Name:* ${data.name}`)
  lines.push(`- *Phone Number:* ${data.phone}`)
  if (data.email) lines.push(`- *Email Address:* ${data.email}`)
  if (data.occasion) lines.push(`- *Occasion:* ${data.occasion}`)
  if (data.date) lines.push(`- *Event Date:* ${data.date}`)
  if (data.interest) {
    const interestLabel =
      data.interest === "rent"
        ? "Renting"
        : data.interest === "buy"
          ? "Buying"
          : "Both Renting & Buying"
    lines.push(`- *Interested In:* ${interestLabel}`)
  }
  if (data.message && data.message.trim()) {
    lines.push(`- *Preferences / Notes:* ${data.message.trim()}`)
  }
  lines.push("")
  lines.push(
    "Could you please share available appointment slots at your Thane atelier?",
  )
  lines.push("Thank you!")

  const message = lines.join("\n")
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
