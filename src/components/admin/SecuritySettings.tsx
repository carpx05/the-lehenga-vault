import React, { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Key, Mail, CheckCircle2, AlertCircle, Shield } from "lucide-react"

export default function SecuritySettings() {
  const { user, updateCredentials, logout } = useAuth()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (!newPassword) {
      setStatus({ type: "error", message: "Please enter a new password." })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." })
      return
    }

    if (newPassword.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters long.",
      })
      return
    }

    setSaving(true)
    try {
      const res = await updateCredentials(user?.email || "", newPassword)
      if (res.success) {
        setStatus({
          type: "success",
          message: "Password updated successfully in Supabase Auth!",
        })
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setStatus({
          type: "error",
          message: res.error || "Failed to update password.",
        })
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred updating your password.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Overview Card */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-semibold">
          Access &amp; Credentials
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-[#2D2418] font-semibold">
          Supabase Account &amp; Security
        </h2>
        <p className="text-xs text-[#5C3D1E] mt-1">
          Your account is authenticated through Supabase Auth using
          cryptographically signed JWT sessions.
        </p>

        <div className="mt-4 p-4 bg-[#EDE3CC]/60 border border-[#D4C4A0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#8B6A3E]" />
              <span className="font-semibold text-[#2D2418]">
                {user?.email || "Authenticated User"}
              </span>
            </div>
            <p className="text-[11px] text-[#8B6A3E] mt-1">
              Role:{" "}
              <strong className="uppercase text-[#2D2418]">{user?.role}</strong>
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase tracking-wider self-start sm:self-auto border border-emerald-300">
            JWT Session Active
          </span>
        </div>
      </div>

      {/* Change Password Form */}
      <form
        onSubmit={handleUpdate}
        className="bg-[#FAF6ED] border border-[#D4C4A0] p-6 sm:p-8 space-y-5 shadow-sm"
      >
        <h3 className="font-serif text-lg text-[#2D2418] font-semibold border-b border-[#D4C4A0] pb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#C9A84C]" />
          Update Supabase Password
        </h3>

        {status && (
          <div
            className={`p-3.5 border text-xs flex items-center gap-2.5 ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-red-50 border-red-300 text-red-900"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#D4C4A0]">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-xs uppercase tracking-wider text-red-700 hover:text-red-900 transition-colors"
          >
            Sign Out
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#2D2418] hover:bg-[#5C3D1E] text-[#FAF6ED] text-xs font-semibold uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}
