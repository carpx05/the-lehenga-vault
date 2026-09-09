export const PRODUCT_CATEGORIES = [
  "Bridal",
  "Indo-Western",
  "Classic",
  "Predraped Sarees",
  "Gowns",
  "Co-ord Sets",
  "Navratri/Festive",
  "Siders",
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export interface Product {
  id: string | number
  title: string
  designer: string
  price: string
  buy_price?: string
  current_price?: string
  rent: string
  tag: string
  available: boolean
  img: string
  thumbnail?: string
  description?: string
  color?: string
  fabric?: string
  size?: string
  sku?: string
  createdAt?: string
  updatedAt?: string
}

export interface AnalyticsEvent {
  id: string
  pathname: string
  title: string
  timestamp: string // ISO string
  sessionId: string
  referrer: string
  device: "Desktop" | "Mobile" | "Tablet"
  browser: string
  country?: string
  durationSeconds?: number
}

export interface DayAnalytics {
  date: string
  label: string
  views: number
  uniqueVisitors: number
}

export interface SupabaseConfig {
  url: string
  anonKey: string
  bucketName: string
  isConnected: boolean
  autoSync: boolean
}
