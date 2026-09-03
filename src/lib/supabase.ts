import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Product, AnalyticsEvent, SupabaseConfig } from "../types"

const STORAGE_KEY = "lehenga_supabase_config"

// Default configuration with optional environment variables
export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl =
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_SUPABASE_URL || ""
  const envKey =
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_SUPABASE_ANON_KEY || ""

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        bucketName: parsed.bucketName || "lehenga-images",
        isConnected: Boolean(parsed.isConnected),
        autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
      }
    }
  } catch {
    // ignore
  }

  return {
    url: envUrl,
    anonKey: envKey,
    bucketName: "lehenga-images",
    isConnected: false,
    autoSync: true,
  }
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseClient(
  configOverride?: SupabaseConfig,
): SupabaseClient | null {
  const config = configOverride || getSavedSupabaseConfig()
  if (!config.url || !config.anonKey) {
    return null
  }

  try {
    if (!supabaseInstance || configOverride) {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: { "x-client-info": "lehenga-vault-web" },
        },
      })
    }
    return supabaseInstance
  } catch {
    return null
  }
}

/**
 * Test the Supabase connection and check/create the storage bucket
 */
export async function testSupabaseConnection(
  config: SupabaseConfig,
): Promise<{
  success: boolean
  message: string
  latencyMs?: number
}> {
  if (!config.url || !config.anonKey) {
    return {
      success: false,
      message: "Please provide both Supabase URL and Anon/Public Key.",
    }
  }

  const startTime = performance.now()
  try {
    const client = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    })

    // Check if we can reach storage buckets
    const { data: buckets, error } = await client.storage.listBuckets()
    const elapsed = Math.round(performance.now() - startTime)

    if (error) {
      return {
        success: false,
        message: `Supabase returned an error: ${error.message}`,
        latencyMs: elapsed,
      }
    }

    const bucketFound = buckets?.some((b) => b.name === config.bucketName)

    return {
      success: true,
      message: bucketFound
        ? `Connected to Supabase! Bucket '${config.bucketName}' is active (${elapsed}ms).`
        : `Connected to Supabase (${elapsed}ms)! Note: Bucket '${config.bucketName}' not found yet. Make sure it's created and set to Public in Supabase Storage.`,
      latencyMs: elapsed,
    }
  } catch (err: unknown) {
    const elapsed = Math.round(performance.now() - startTime)
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error connecting to Supabase"
    return { success: false, message: msg, latencyMs: elapsed }
  }
}

/**
 * Upload an image directly to Supabase Storage with latency-friendly caching headers
 */
export async function uploadImageToSupabase(
  file: File | Blob,
  fileName: string,
  config?: SupabaseConfig,
): Promise<{ url: string error?: string }> {
  const currentConfig = config || getSavedSupabaseConfig()
  const client = getSupabaseClient(currentConfig)

  if (!client) {
    throw new Error(
      "Supabase is not configured. Please add your credentials in SuperAdmin -> Cloud Settings.",
    )
  }

  const cleanName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const bucket = currentConfig.bucketName || "lehenga-images"

  // Upload with 1 year cache-control for maximum CDN speed
  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(cleanName, file, {
      cacheControl: "31536000",
      upsert: true,
      contentType: (file as File).type || "image/webp",
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data } = client.storage.from(bucket).getPublicUrl(cleanName)
  return { url: data.publicUrl }
}

/**
 * Sync products to Supabase DB table `products` (cloud mirror)
 */
export async function syncProductsToSupabase(
  products: Product[],
  config?: SupabaseConfig,
): Promise<boolean> {
  const client = getSupabaseClient(config)
  if (!client) return false

  try {
    const formatted = products.map((p) => ({
      id: String(p.id),
      title: p.title,
      designer: p.designer,
      price: p.price,
      rent: p.rent,
      tag: p.tag,
      available: p.available,
      img: p.img,
      thumbnail: p.thumbnail || "",
      description: p.description || "",
      sku: p.sku || "",
      color: p.color || "",
      fabric: p.fabric || "",
      size: p.size || "",
      updated_at: new Date().toISOString(),
    }))

    const { error } = await client
      .from("products")
      .upsert(formatted, { onConflict: "id" })
    if (error) {
      console.warn("Supabase products sync warning:", error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn("Supabase products sync error:", err)
    return false
  }
}

/**
 * Fetch products from Supabase DB table `products`
 */
export async function fetchProductsFromSupabase(
  config?: SupabaseConfig,
): Promise<Product[] | null> {
  const client = getSupabaseClient(config)
  if (!client) return null

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (error || !data) return null

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      designer: item.designer,
      price: item.price,
      rent: item.rent,
      tag: item.tag,
      available: Boolean(item.available),
      img: item.img,
      thumbnail: item.thumbnail,
      description: item.description,
      sku: item.sku,
      color: item.color,
      fabric: item.fabric,
      size: item.size,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  } catch {
    return null
  }
}

/**
 * Record a live page view to Supabase DB table `page_views`
 */
export async function recordPageViewToSupabase(
  event: AnalyticsEvent,
  config?: SupabaseConfig,
): Promise<boolean> {
  const client = getSupabaseClient(config)
  if (!client) return false

  try {
    const { error } = await client.from("page_views").insert([
      {
        pathname: event.pathname,
        title: event.title,
        session_id: event.sessionId,
        referrer: event.referrer,
        device: event.device,
        browser: event.browser,
        created_at: event.timestamp,
      },
    ])

    if (error) {
      console.warn("Supabase page_view insert notice:", error.message)
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Fetch live visitor telemetry from Supabase DB table `page_views`
 */
export async function fetchPageViewsFromSupabase(
  config?: SupabaseConfig,
): Promise<AnalyticsEvent[] | null> {
  const client = getSupabaseClient(config)
  if (!client) return null

  try {
    const { data, error } = await client
      .from("page_views")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)

    if (error || !data) return null

    return data.map((item) => ({
      id: String(item.id),
      pathname: item.pathname,
      title: item.title || item.pathname,
      timestamp: item.created_at,
      sessionId: item.session_id || `sess-${item.id}`,
      referrer: item.referrer || "Direct",
      device: item.device as "Desktop" | "Mobile" | "Tablet" || "Mobile",
      browser: item.browser || "Browser",
    }))
  } catch {
    return null
  }
}
