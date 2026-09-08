import { Product } from "../types"

export interface PricingDetails {
  currentPrice: string
  buyPrice: string
  hasDiscount: boolean
  discountPercent?: number
  discountSavings?: number
}

/**
 * Extracts a numeric value from a price string, e.g. "₹85,000" -> 85000
 */
export function parsePriceNumber(val?: string | number | null): number | null {
  if (val === undefined || val === null) return null
  if (typeof val === "number") return isNaN(val) ? null : val
  const cleaned = String(val).replace(/[^0-9.]/g, "")
  if (!cleaned) return null
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

/**
 * Formats a currency string with Rupee symbol and Indian thousand grouping
 */
export function formatCurrency(val?: string | number | null): string {
  if (val === undefined || val === null || val === "") return "₹0"
  const str = String(val).trim()
  if (str.startsWith("₹")) {
    return str
  }
  const num = parsePriceNumber(str)
  if (num !== null) {
    return `₹${num.toLocaleString("en-IN")}`
  }
  return `₹${str}`
}

/**
 * Calculates pricing details for a product, prioritizing `current_price`.
 * If ever there is a difference between `buy_price` and `current_price`,
 * flags `hasDiscount = true` with calculated savings and percentage.
 */
export function getPricingDetails(product: Partial<Product>): PricingDetails {
  // 1. Take current_price as priority, fallback to price or buy_price
  const rawCurrent =
    product.current_price || product.price || product.buy_price || "₹0"
  // 2. Buy price is the original purchase price
  const rawBuy = product.buy_price || product.price || rawCurrent

  const currentFormatted = formatCurrency(rawCurrent)
  const buyFormatted = formatCurrency(rawBuy)

  const currentNum = parsePriceNumber(rawCurrent)
  const buyNum = parsePriceNumber(rawBuy)

  // Compare numeric values if both can be parsed
  if (buyNum !== null && currentNum !== null && buyNum > currentNum) {
    const savings = buyNum - currentNum
    const percent = Math.round((savings / buyNum) * 100)
    return {
      currentPrice: currentFormatted,
      buyPrice: buyFormatted,
      hasDiscount: true,
      discountPercent: percent,
      discountSavings: savings,
    }
  }

  // Fallback string difference check for non-standard formats
  if (
    product.buy_price &&
    product.current_price &&
    buyFormatted.toLowerCase() !== currentFormatted.toLowerCase()
  ) {
    return {
      currentPrice: currentFormatted,
      buyPrice: buyFormatted,
      hasDiscount: true,
    }
  }

  return {
    currentPrice: currentFormatted,
    buyPrice: buyFormatted,
    hasDiscount: false,
  }
}
