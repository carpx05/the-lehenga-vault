import React, { useState } from "react"
import { useAnalytics } from "../../context/AnalyticsContext"
import { useProducts } from "../../context/ProductContext"
import {
  Users,
  Eye,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  Compass,
  ArrowUpRight,
  Download,
  Trash2,
} from "lucide-react"

export default function AnalyticsDashboard() {
  const {
    events,
    totalViews,
    uniqueVisitors,
    liveVisitors,
    dailyStats,
    topPages,
    deviceStats,
    referrerStats,
    clearAnalytics,
    refreshFromCloud,
    isCloudConnected,
  } = useAnalytics()

  const { products } = useProducts()
  const [selectedRange, setSelectedRange] = useState<"7d" | "today" | "all">(
    "7d",
  )
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Inventory stats
  const availableCount = products.filter((p) => p.available).length
  const maxDayViews = Math.max(...dailyStats.map((d) => d.views), 1)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshFromCloud()
    setIsRefreshing(false)
  }

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(events, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute(
      "download",
      `lehenga_vault_analytics_${new Date().toISOString().split("T")[0]}.json`,
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#EDE3CC]/60 p-6 border border-[#D4C4A0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold border ${
                isCloudConnected
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                  : "bg-amber-100 border-amber-300 text-amber-900"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudConnected
                    ? "bg-emerald-500 animate-ping"
                    : "bg-amber-600"
                }`}
              />
              {isCloudConnected
                ? "Supabase Cloud Telemetry"
                : "Local Browser Telemetry"}
            </span>
            <span className="text-xs text-[#8B6A3E]">
              {events.length} total event{events.length === 1 ? "" : "s"} logged
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#2D2418] font-semibold">
            Store Traffic &amp; Visitor Insights
          </h2>
          <p className="text-xs text-[#5C3D1E] mt-1">
            Real-time analytics captured from real visitor sessions across your
            bridal atelier storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-xs font-medium uppercase tracking-wider hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? "animate-spin text-[#C9A84C]" : ""
              }`}
            />
            {isRefreshing ? "Syncing..." : "Refresh Telemetry"}
          </button>
          <button
            onClick={handleExportData}
            disabled={events.length === 0}
            className="px-3.5 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-xs font-medium uppercase tracking-wider hover:border-[#2D2418] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#8B6A3E]" />
            {copiedNotification ? "Exported JSON!" : "Export Report"}
          </button>
          {events.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all recorded telemetry logs?")) {
                  clearAnalytics()
                }
              }}
              title="Clear telemetry logs"
              className="p-2 bg-[#FAF6ED] border border-[#D4C4A0] text-[#8B6A3E] hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Views */}
        <div className="bg-[#FAF6ED] p-6 border border-[#D4C4A0] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
              Total Page Views
            </span>
            <div className="w-9 h-9 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-semibold text-[#2D2418]">
              {totalViews.toLocaleString()}
            </span>
            {totalViews > 0 && (
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8B6A3E] mt-2">
            Total live customer impressions across catalog
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C9A84C]/40 group-hover:bg-[#C9A84C] transition-colors" />
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="bg-[#FAF6ED] p-6 border border-[#D4C4A0] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
              Unique Visitors
            </span>
            <div className="w-9 h-9 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-semibold text-[#2D2418]">
              {uniqueVisitors.toLocaleString()}
            </span>
            <span className="text-xs text-[#8B6A3E] uppercase font-medium">
              Distinct Shoppers
            </span>
          </div>
          <p className="text-[11px] text-[#8B6A3E] mt-2">
            Calculated from unique visitor sessions
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8B6A3E]/40 group-hover:bg-[#8B6A3E] transition-colors" />
        </div>

        {/* Card 3: Live Active Visitors */}
        <div className="bg-[#2D2418] text-[#EDE3CC] p-6 border border-[#5C3D1E] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A84C] font-semibold">
              Active Right Now
            </span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-semibold text-[#FAF6ED]">
              {liveVisitors}
            </span>
            <span className="text-xs text-[#D4B483] uppercase tracking-wider font-medium">
              {liveVisitors === 1 ? "Active Session" : "Active Sessions"}
            </span>
          </div>
          <p className="text-[11px] text-[#C4B49A] mt-2">
            Active within the last 15 minutes
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 4: Inventory Ready */}
        <div className="bg-[#FAF6ED] p-6 border border-[#D4C4A0] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
              Vault Availability
            </span>
            <div className="w-9 h-9 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl md:text-4xl font-semibold text-[#2D2418]">
              {availableCount}
            </span>
            <span className="text-xs text-[#8B6A3E]">
              / {products.length} pieces ready
            </span>
          </div>
          <p className="text-[11px] text-[#8B6A3E] mt-2">
            {products.length - availableCount} currently rented out / booked
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4B483]/60 group-hover:bg-[#C9A84C] transition-colors" />
        </div>
      </div>

      {/* Traffic Trend Visualizer Chart */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-semibold">
              Weekly Velocity
            </span>
            <h3 className="font-serif text-xl text-[#2D2418] font-semibold">
              Live Website Visits Over Past 7 Days
            </h3>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#EDE3CC] border border-[#D4C4A0]">
            {(["7d", "today", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-all ${
                  selectedRange === range
                    ? "bg-[#2D2418] text-[#FAF6ED]"
                    : "text-[#5C3D1E] hover:text-[#2D2418]"
                }`}
              >
                {range === "7d"
                  ? "Past 7 Days"
                  : range === "today"
                    ? "Today"
                    : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar / Curve Chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 gap-2 md:gap-4 items-end h-48 md:h-56 border-b border-[#D4C4A0] pb-2">
            {dailyStats.map((item, index) => {
              const heightPercent =
                maxDayViews > 0 && item.views > 0
                  ? Math.max(15, Math.round((item.views / maxDayViews) * 100))
                  : 4 // subtle base line if 0
              const isToday = index === dailyStats.length - 1

              return (
                <div
                  key={item.date}
                  className="flex flex-col items-center gap-2 h-full justify-end group"
                >
                  {/* Tooltip value */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-[10px] font-medium text-[#FAF6ED] bg-[#2D2418] px-2 py-1 rounded-none shadow-sm whitespace-nowrap -translate-y-1">
                    {item.views} view{item.views === 1 ? "" : "s"} (
                    {item.uniqueVisitors} visitor
                    {item.uniqueVisitors === 1 ? "" : "s"})
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-[#EDE3CC] rounded-t-sm flex items-end overflow-hidden relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full transition-all duration-500 rounded-t-sm relative ${
                        item.views === 0
                          ? "bg-[#D4C4A0]"
                          : isToday
                            ? "bg-[#C9A84C]"
                            : "bg-[#2D2418] group-hover:bg-[#8B6A3E]"
                      }`}
                    >
                      {item.views > 0 && (
                        <div className="absolute top-1 left-0 right-0 text-center text-[10px] font-semibold text-[#FAF6ED] opacity-90">
                          {item.views}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] md:text-xs tracking-wider uppercase truncate max-w-full font-medium ${
                      isToday ? "text-[#C9A84C] font-bold" : "text-[#8B6A3E]"
                    }`}
                  >
                    {item.label.split(",")[0]}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-[#8B6A3E] mt-3">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#2D2418] inline-block" /> Past
              Days
              <span className="w-2.5 h-2.5 bg-[#C9A84C] inline-block ml-3" />{" "}
              Today
            </span>
            <span>
              Peak Day: {Math.max(...dailyStats.map((d) => d.views))} views
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Visited Pages */}
        <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
                Page Analytics
              </span>
              <h4 className="font-serif text-lg text-[#2D2418] font-semibold">
                Live Store Page Views
              </h4>
            </div>
            <Compass className="w-5 h-5 text-[#8B6A3E]" />
          </div>

          {topPages.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8B6A3E]">
              No pageviews recorded yet. Open the storefront to begin logging
              telemetry.
            </div>
          ) : (
            <div className="space-y-4">
              {topPages.map((page) => (
                <div key={page.path} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#2D2418]">
                        {page.label}
                      </span>
                      <span className="text-[10px] text-[#8B6A3E] font-mono">
                        {page.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-[#2D2418]">{page.views} views</span>
                      <span className="text-[#8B6A3E] text-[11px]">
                        ({page.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#EDE3CC] h-2 rounded-none overflow-hidden">
                    <div
                      className="bg-[#C9A84C] h-full transition-all duration-500"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Device Breakdown & Traffic Sources */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
                  Audience Tech
                </span>
                <h4 className="font-serif text-lg text-[#2D2418] font-semibold">
                  Device Breakdown
                </h4>
              </div>
              <Smartphone className="w-5 h-5 text-[#8B6A3E]" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {deviceStats.map((item) => (
                <div
                  key={item.device}
                  className="bg-[#EDE3CC]/60 p-3.5 text-center border border-[#D4C4A0]"
                >
                  <div className="flex justify-center mb-1 text-[#8B6A3E]">
                    {item.device === "Mobile" ? (
                      <Smartphone className="w-4 h-4 text-[#C9A84C]" />
                    ) : item.device === "Desktop" ? (
                      <Monitor className="w-4 h-4 text-[#8B6A3E]" />
                    ) : (
                      <Tablet className="w-4 h-4 text-[#2D2418]" />
                    )}
                  </div>
                  <p className="font-serif text-xl font-bold text-[#2D2418]">
                    {item.percentage}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#8B6A3E]">
                    {item.device}
                  </p>
                  <p className="text-[10px] text-[#5C3D1E] mt-0.5">
                    {item.count} sessions
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Channels / Referrers */}
          <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
                  Acquisition
                </span>
                <h4 className="font-serif text-lg text-[#2D2418] font-semibold">
                  Traffic Referrers
                </h4>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#8B6A3E]" />
            </div>

            {referrerStats.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#8B6A3E]">
                No referrer traffic recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {referrerStats.map((item) => (
                  <div
                    key={item.source}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#EDE3CC] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                      <span className="font-medium text-[#2D2418]">
                        {item.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#5C3D1E] font-medium">
                        {item.count} visits
                      </span>
                      <span className="text-[10px] text-[#8B6A3E] font-semibold bg-[#EDE3CC] px-2 py-0.5">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Recent Activity Feed */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-medium">
              Stream
            </span>
            <h4 className="font-serif text-lg text-[#2D2418] font-semibold">
              Live Activity Stream
            </h4>
          </div>
          <span className="text-xs text-[#8B6A3E]">
            Showing latest {Math.min(events.length, 12)} events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8B6A3E]">
            No activity recorded yet. Browse the site in another tab to see live
            events stream here in real time!
          </div>
        ) : (
          <div className="divide-y divide-[#EDE3CC]">
            {events.slice(0, 12).map((evt) => {
              const timeAgo = (() => {
                const diffMs = Date.now() - new Date(evt.timestamp).getTime()
                const mins = Math.floor(diffMs / 60000)
                if (mins < 1) return "Just now"
                if (mins < 60) return `${mins}m ago`
                const hrs = Math.floor(mins / 60)
                if (hrs < 24) return `${hrs}h ago`
                return `${Math.floor(hrs / 24)}d ago`
              })()

              return (
                <div
                  key={evt.id}
                  className="py-3 flex items-center justify-between text-xs gap-4 hover:bg-[#EDE3CC]/30 px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E] flex-shrink-0">
                      {evt.device === "Mobile" ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#2D2418] truncate">
                        Visited{" "}
                        <span className="text-[#C9A84C] font-semibold">
                          {evt.pathname}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#8B6A3E] truncate">
                        Via {evt.referrer} · {evt.browser} ({evt.device})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-[#8B6A3E] font-medium">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
