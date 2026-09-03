import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { AnalyticsEvent, DayAnalytics } from "../types"
import {
  getSavedSupabaseConfig,
  recordPageViewToSupabase,
  fetchPageViewsFromSupabase,
} from "../lib/supabase"

const ANALYTICS_STORAGE_KEY = "lehenga_vault_analytics_live_events_v2"

interface AnalyticsContextType {
  events: AnalyticsEvent[]
  totalViews: number
  uniqueVisitors: number
  liveVisitors: number
  dailyStats: DayAnalytics[]
  topPages: { path: string label: string views: number percentage: number }[]
  deviceStats: {
    device: string
    count: number
    percentage: number
    color: string
  }[]
  referrerStats: { source: string count: number percentage: number }[]
  trackPageView: (pathname: string, title?: string) => void
  clearAnalytics: () => void
  refreshFromCloud: () => Promise<void>
  isCloudConnected: boolean
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
)

function getDeviceType(): "Desktop" | "Mobile" | "Tablet" {
  if (typeof window === "undefined") return "Desktop"
  const w = window.innerWidth
  const ua = navigator.userAgent.toLowerCase()
  if (
    /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) ||
    (w >= 768 && w <= 1024)
  ) {
    return "Tablet"
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua) ||
    w < 768
  ) {
    return "Mobile"
  }
  return "Desktop"
}

function getReferrerSource(): string {
  if (typeof document === "undefined") return "Direct"
  const ref = document.referrer.toLowerCase()
  if (!ref) return "Direct"
  if (ref.includes("instagram.com")) return "Instagram"
  if (ref.includes("google.")) return "Google Search"
  if (ref.includes("facebook.com")) return "Facebook"
  if (ref.includes("pinterest.com")) return "Pinterest"
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "WhatsApp"
  return "Other Referral"
}

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") return "sess-local"
  let id = sessionStorage.getItem("lehenga_session_id")
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    sessionStorage.setItem("lehenga_session_id", id)
  }
  return id
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Start with clean live events from localStorage (zero dummy data)
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return []
  })

  const [isCloudConnected, setIsCloudConnected] = useState(false)

  // Sync with Supabase on startup if configured
  useEffect(() => {
    const config = getSavedSupabaseConfig()
    setIsCloudConnected(
      Boolean(config.isConnected && config.url && config.anonKey),
    )

    if (config.isConnected && config.url && config.anonKey) {
      fetchPageViewsFromSupabase(config).then((cloudEvents) => {
        if (cloudEvents && cloudEvents.length > 0) {
          setEvents(cloudEvents)
        }
      })
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events))
    } catch {
      // storage full
    }
  }, [events])

  const trackPageView = useCallback((pathname: string, title?: string) => {
    // Ignore tracking of the admin dashboard itself to keep customer analytics clean
    if (pathname.startsWith("/admin")) return

    const newEvent: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pathname,
      title:
        title || (typeof document !== "undefined" ? document.title : pathname),
      timestamp: new Date().toISOString(),
      sessionId: getOrCreateSessionId(),
      referrer: getReferrerSource(),
      device: getDeviceType(),
      browser:
        typeof navigator !== "undefined" &&
        navigator.userAgent.includes("Chrome")
          ? "Chrome"
          : typeof navigator !== "undefined" &&
              navigator.userAgent.includes("Safari")
            ? "Safari"
            : typeof navigator !== "undefined" &&
                navigator.userAgent.includes("Firefox")
              ? "Firefox"
              : "Browser",
    }

    setEvents((prev) => [newEvent, ...prev.slice(0, 499)])

    // Push to Supabase if connected
    const config = getSavedSupabaseConfig()
    if (config.isConnected && config.url && config.anonKey) {
      recordPageViewToSupabase(newEvent, config).catch(console.warn)
    }
  }, [])

  const refreshFromCloud = useCallback(async () => {
    const config = getSavedSupabaseConfig()
    if (config.isConnected && config.url && config.anonKey) {
      const cloudEvents = await fetchPageViewsFromSupabase(config)
      if (cloudEvents) {
        setEvents(cloudEvents)
        setIsCloudConnected(true)
      }
    }
  }, [])

  const clearAnalytics = useCallback(() => {
    setEvents([])
    localStorage.removeItem(ANALYTICS_STORAGE_KEY)
  }, [])

  // 100% Real Analytics Computation (Zero Dummy Data)
  const totalViews = events.length
  const uniqueSessionSet = new Set(events.map((e) => e.sessionId))
  const uniqueVisitors = uniqueSessionSet.size

  // Real Active Live Visitors: distinct sessions with events in the last 15 minutes
  const fifteenMinsAgo = Date.now() - 15 * 60 * 1000
  const recentActiveSessions = new Set(
    events
      .filter((e) => new Date(e.timestamp).getTime() >= fifteenMinsAgo)
      .map((e) => e.sessionId),
  )
  // Default to 1 if current user has an active session, otherwise actual active count
  const liveVisitors = Math.max(
    recentActiveSessions.size,
    events.length > 0 ? 1 : 0,
  )

  // Real Daily statistics for the last 7 calendar days
  const dailyStats: DayAnalytics[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split("T")[0]
    const dayLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

    // Count strictly real events on this date
    const dayEvents = events.filter((e) => e.timestamp.startsWith(dateStr))
    const dayUniques = new Set(dayEvents.map((e) => e.sessionId)).size

    return {
      date: dateStr,
      label: dayLabel,
      views: dayEvents.length,
      uniqueVisitors: dayUniques,
    }
  })

  // Real Top pages breakdown
  const pageMap: Record<string, { label: string count: number }> = {}
  const routeLabels: Record<string, string> = {
    "/": "Home Showcase",
    "/collections": "Our Collections",
    "/rent-buy": "Rent & Buy Guides",
    "/contact": "Appointment Booking",
    "/about": "Our Story & Atelier",
  }

  events.forEach((e) => {
    const label = routeLabels[e.pathname] || e.pathname
    if (pageMap[e.pathname]) {
      pageMap[e.pathname].count += 1
    } else {
      pageMap[e.pathname] = { label, count: 1 }
    }
  })

  const totalPageCount = Object.values(pageMap).reduce(
    (sum, item) => sum + item.count,
    0,
  )
  const topPages = Object.entries(pageMap)
    .map(([path, data]) => ({
      path,
      label: data.label,
      views: data.count,
      percentage:
        totalPageCount > 0
          ? Math.round((data.count / totalPageCount) * 100)
          : 0,
    }))
    .sort((a, b) => b.views - a.views)

  // Real Device breakdown
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 }
  events.forEach((e) => {
    if (e.device === "Mobile") deviceCounts.Mobile += 1
    else if (e.device === "Desktop") deviceCounts.Desktop += 1
    else if (e.device === "Tablet") deviceCounts.Tablet += 1
  })
  const totalDevices =
    deviceCounts.Mobile + deviceCounts.Desktop + deviceCounts.Tablet || 1
  const deviceStats = [
    {
      device: "Mobile",
      count: deviceCounts.Mobile,
      percentage:
        events.length > 0
          ? Math.round((deviceCounts.Mobile / totalDevices) * 100)
          : 0,
      color: "#C9A84C",
    },
    {
      device: "Desktop",
      count: deviceCounts.Desktop,
      percentage:
        events.length > 0
          ? Math.round((deviceCounts.Desktop / totalDevices) * 100)
          : 0,
      color: "#8B6A3E",
    },
    {
      device: "Tablet",
      count: deviceCounts.Tablet,
      percentage:
        events.length > 0
          ? Math.round((deviceCounts.Tablet / totalDevices) * 100)
          : 0,
      color: "#2D2418",
    },
  ]

  // Real Referrers breakdown
  const refMap: Record<string, number> = {}
  events.forEach((e) => {
    refMap[e.referrer] = (refMap[e.referrer] || 0) + 1
  })
  const totalRefs = Object.values(refMap).reduce((a, b) => a + b, 0) || 1
  const referrerStats = Object.entries(refMap)
    .map(([source, count]) => ({
      source,
      count,
      percentage: events.length > 0 ? Math.round((count / totalRefs) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <AnalyticsContext.Provider
      value={{
        events,
        totalViews,
        uniqueVisitors,
        liveVisitors,
        dailyStats,
        topPages,
        deviceStats,
        referrerStats,
        trackPageView,
        clearAnalytics,
        refreshFromCloud,
        isCloudConnected,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
