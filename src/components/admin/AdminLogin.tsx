import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail] = useState("thelehengavault@gmail.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(
          result.error ||
            "Authentication failed. Check your Supabase credentials.",
        )
      }
    } catch {
      setError("An unexpected error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAdmin = () => {
    setEmail("thelehengavault@gmail.com")
    setPassword("")
    setError("")
  }

  const handleSelectSuperAdmin = () => {
    setEmail("ayush.b302@gmail.com")
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-[#2D2418] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-[#8B6A3E]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4B483] hover:text-[#FAF6ED] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Public Store
        </Link>

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#3D3020] border border-[#C9A84C]/40 text-[#C9A84C] mb-4 shadow-xl">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9A84C] font-semibold">
            Vault Security
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#EDE3CC] font-semibold mt-1">
            Staff &amp; Admin Portal
          </h2>
          <p className="text-xs text-[#C4B49A] mt-2 tracking-wide">
            Authenticate using your Supabase account to manage inventory &amp;
            review real-time telemetry.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-[#3D3020]/90 backdrop-blur-md border border-[#C9A84C]/30 shadow-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-950/60 border border-red-500/50 text-red-200 text-xs rounded-none flex items-start gap-3">
              <span className="text-red-400 font-bold text-sm">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#D4B483] font-medium mb-2">
                Supabase Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B6A3E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@thelehengavault.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#2D2418] border border-[#5C3D1E] text-[#FAF6ED] text-sm placeholder-[#6B5640] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#D4B483] font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B6A3E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#2D2418] border border-[#5C3D1E] text-[#FAF6ED] text-sm placeholder-[#6B5640] focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8B6A3E] hover:text-[#C9A84C]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-xs font-semibold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FAF6ED] border-t-transparent rounded-full animate-spin" />
                  Verifying JWT Token...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Vault
                </>
              )}
            </button>
          </form>

          {/* Quick Account Switcher Helper */}
          <div className="mt-6 pt-6 border-t border-[#5C3D1E]/60 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#8B6A3E] text-center mb-2">
              Select Authorized User
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleSelectAdmin}
                className={`p-2.5 bg-[#2D2418] border text-left text-xs transition-colors flex items-center justify-between ${
                  email === "thelehengavault@gmail.com"
                    ? "border-[#C9A84C] text-[#FAF6ED]"
                    : "border-[#5C3D1E] text-[#D4B483] hover:border-[#C9A84C]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>thelehengavault@gmail.com</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest bg-[#5C3D1E] text-[#D4B483] px-2 py-0.5 font-bold">
                  Staff Admin
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectSuperAdmin}
                className={`p-2.5 bg-[#2D2418] border text-left text-xs transition-colors flex items-center justify-between ${
                  email === "ayush.b302@gmail.com"
                    ? "border-[#C9A84C] text-[#FAF6ED]"
                    : "border-[#5C3D1E] text-[#D4B483] hover:border-[#C9A84C]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>ayush.b302@gmail.com</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest bg-[#C9A84C] text-[#2D2418] px-2 py-0.5 font-bold">
                  SuperAdmin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
