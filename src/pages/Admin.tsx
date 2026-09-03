import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useAnalytics } from "../context/AnalyticsContext"
import AdminLogin from "../components/admin/AdminLogin"
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard"
import InventoryManager from "../components/admin/InventoryManager"
import SupabaseSettings from "../components/admin/SupabaseSettings"
import SecuritySettings from "../components/admin/SecuritySettings"
import {
  BarChart3,
  Layers,
  Cloud,
  Shield,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react"

type AdminTab = "analytics" | "inventory" | "supabase" | "security"

export default function Admin() {
  const { isAuthenticated, user, logout, isSuperAdmin } = useAuth()
  const { liveVisitors } = useAnalytics()
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics")

  // If not logged in, render the login view
  if (!isAuthenticated) {
    return <AdminLogin />
  }

  // Define tab navigation based on role:
  // Staff 'admin' only sees Analytics, Inventory, and Passcode.
  // 'superadmin' sees full technical Supabase & Storage infrastructure.
  const tabs: {
    id: AdminTab
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { id: "analytics", label: "Analytics & Traffic", icon: BarChart3 },
    { id: "inventory", label: "Vault Inventory", icon: Layers },
    ...(isSuperAdmin
      ? [
          {
            id: "supabase" as AdminTab,
            label: "Supabase & Storage",
            icon: Cloud,
          },
        ]
      : []),
    { id: "security", label: "Security & Passcode", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-[#F5EDD8] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#2D2418] text-[#EDE3CC] border-b border-[#5C3D1E] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif text-lg font-semibold text-[#D4B483] group-hover:text-[#FAF6ED] transition-colors">
                The Lehenga Vault
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase px-2 py-0.5 font-bold ${
                  isSuperAdmin
                    ? "bg-[#C9A84C] text-[#2D2418]"
                    : "bg-[#5C3D1E] text-[#FAF6ED]"
                }`}
              >
                {user?.role === "superadmin" ? "SuperAdmin" : "Staff Admin"}
              </span>
            </Link>

            {/* Live Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs text-[#C4B49A] border-l border-[#5C3D1E] pl-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                {liveVisitors} active live visitor
                {liveVisitors === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#5C3D1E] hover:border-[#C9A84C] text-xs text-[#C4B49A] hover:text-[#FAF6ED] transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-[#C9A84C]" />
            </Link>

            <div className="flex items-center gap-2 text-xs text-[#C4B49A] border-l border-[#5C3D1E] pl-3">
              <span className="hidden sm:inline text-[11px]">
                Signed in as <strong>{user?.email || user?.username}</strong> (
                {user?.role})
              </span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-[#C4B49A] hover:text-red-400 hover:bg-[#3D3020] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-3 shadow-sm sticky top-24">
            <div className="p-3 border-b border-[#EDE3CC] mb-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-semibold">
                {isSuperAdmin ? "Master Control" : "Boutique Manager"}
              </p>
              <p className="font-serif text-sm font-semibold text-[#2D2418]">
                {isSuperAdmin ? "Superadmin Workspace" : "Admin Workspace"}
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full text-left px-3.5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-3 transition-all border ${
                      isActive
                        ? "bg-[#2D2418] text-[#FAF6ED] border-[#2D2418] shadow-sm"
                        : "border-transparent text-[#5C3D1E] hover:bg-[#EDE3CC] hover:text-[#2D2418]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#C9A84C]" : "text-[#8B6A3E]"
                      }`}
                    />
                    <span>{label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#EDE3CC] p-2 text-[11px] text-[#8B6A3E] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
              <span>
                {isSuperAdmin
                  ? "Cloud DB & Storage telemetry active"
                  : "Live storefront synchronized"}
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "inventory" && <InventoryManager />}
          {activeTab === "supabase" && isSuperAdmin && <SupabaseSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </main>
      </div>
    </div>
  )
}
