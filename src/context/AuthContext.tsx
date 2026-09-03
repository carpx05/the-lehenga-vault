import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { getSupabaseClient } from "../lib/supabase"

export interface AdminUser {
  id?: string
  email: string
  username: string
  role: "admin" | "superadmin"
  loginTime: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: AdminUser | null
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean error?: string }>
  logout: () => void
  updateCredentials: (
    newUsername: string,
    newPassword: string,
  ) => Promise<{ success: boolean error?: string }>
  currentUsername: string
  isSuperAdmin: boolean
}

const AUTH_STORAGE_KEY = "lehenga_admin_session_v3"
const SUPERADMIN_EMAILS = ["ayush.b302@gmail.com"]

function determineRole(email: string): "admin" | "superadmin" {
  const clean = email.toLowerCase().trim()
  if (SUPERADMIN_EMAILS.includes(clean)) {
    return "superadmin"
  }
  return "admin"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed
      }
    } catch {
      // ignore
    }
    return null
  })

  const isAuthenticated = Boolean(user)
  const isSuperAdmin = user?.role === "superadmin"

  // Check Supabase session on mount & listen for auth state changes
  useEffect(() => {
    const client = getSupabaseClient()
    if (!client) return

    // Check active session
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || ""
        const adminData: AdminUser = {
          id: session.user.id,
          email,
          username: email.split("@")[0],
          role: determineRole(email),
          loginTime: new Date().toISOString(),
        }
        setUser(adminData)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData))
      }
    })

    // Listen to token refreshes and login/logout events
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const email = session.user.email || ""
          const adminData: AdminUser = {
            id: session.user.id,
            email,
            username: email.split("@")[0],
            role: determineRole(email),
            loginTime: new Date().toISOString(),
          }
          setUser(adminData)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData))
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (emailInput: string, p: string): Promise<{
      success: boolean
      error?: string
    }> => {
      const cleanEmail = emailInput.trim().toLowerCase()
      const client = getSupabaseClient()

      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: p,
          })

          if (error) {
            return {
              success: false,
              error: error.message || "Invalid email or password.",
            }
          }

          if (data.user) {
            const email = data.user.email || cleanEmail
            const adminData: AdminUser = {
              id: data.user.id,
              email,
              username: email.split("@")[0],
              role: determineRole(email),
              loginTime: new Date().toISOString(),
            }
            setUser(adminData)
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData))
            return { success: true }
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Authentication failed"
          return { success: false, error: msg }
        }
      }

      // Offline / Local fallback if Supabase client not yet configured
      if (
        cleanEmail === "thelehengavault@gmail.com" ||
        cleanEmail === "admin"
      ) {
        if (p === "vault@2026") {
          const adminData: AdminUser = {
            email: "thelehengavault@gmail.com",
            username: "thelehengavault",
            role: "admin",
            loginTime: new Date().toISOString(),
          }
          setUser(adminData)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData))
          return { success: true }
        }
      } else if (
        cleanEmail === "ayush.b302@gmail.com" ||
        cleanEmail === "superadmin"
      ) {
        if (p === "super@vault2026") {
          const adminData: AdminUser = {
            email: "ayush.b302@gmail.com",
            username: "ayush.b302",
            role: "superadmin",
            loginTime: new Date().toISOString(),
          }
          setUser(adminData)
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData))
          return { success: true }
        }
      }

      return {
        success: false,
        error:
          "Invalid email or password. Please verify credentials in Supabase Auth.",
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    const client = getSupabaseClient()
    if (client) {
      try {
        await client.auth.signOut()
      } catch {
        // ignore
      }
    }
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  const updateCredentials = useCallback(
    async (_newU: string, newP: string): Promise<{
      success: boolean
      error?: string
    }> => {
      if (!user) return { success: false, error: "Not authenticated" }
      if (!newP || newP.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters long.",
        }
      }

      const client = getSupabaseClient()
      if (client) {
        const { error } = await client.auth.updateUser({ password: newP })
        if (error) {
          return { success: false, error: error.message }
        }
        return { success: true }
      }

      return { success: true }
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateCredentials,
        currentUsername: user?.email || user?.username || "admin",
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
