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
      const url = parsed.url || envUrl
      const anonKey = parsed.anonKey || envKey
      return {
        url,
        anonKey,
        bucketName: parsed.bucketName || "lehenga-images",
        isConnected:
          parsed.isConnected !== undefined
            ? Boolean(parsed.isConnected)
            : Boolean(url && anonKey),
        autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
      }
    }
  } catch {
    // ignore
  }

  const hasEnvCreds = Boolean(envUrl && envKey)
  return {
    url: envUrl,
    anonKey: envKey,
    bucketName: "lehenga-images",
    isConnected: hasEnvCreds,
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

    // 1. Check storage bucket reachability
    let bucketFound = false
    try {
      const { error: listErr } = await client.storage
        .from(config.bucketName)
        .list("", { limit: 1 })

      if (!listErr) {
        bucketFound = true
      } else if (
        listErr.message?.toLowerCase().includes("not found") ||
        listErr.message?.toLowerCase().includes("does not exist")
      ) {
        bucketFound = false
      } else {
        // Bucket exists but may have restricted list permissions
        bucketFound = true
      }
    } catch {
      try {
        const { data: buckets } = await client.storage.listBuckets()
        bucketFound = Boolean(
          buckets?.some((b) => b.name === config.bucketName),
        )
      } catch {
        bucketFound = false
      }
    }

    // 2. Check if table exists in PostgreSQL (check lowercase 'products' and capitalized 'Products')
    let tableFound = false
    let activeTable = "products"
    let tableErrorMsg = ""

    const { error: errLower } = await client
      .from("products")
      .select("id")
      .limit(1)

    if (!errLower) {
      tableFound = true
      activeTable = "products"
    } else {
      // Check capitalized 'Products' (common if created manually in Supabase Dashboard)
      const { error: errCap } = await client
        .from("Products")
        .select("id")
        .limit(1)

      if (!errCap) {
        tableFound = true
        activeTable = "Products"
      } else {
        tableErrorMsg = errLower.message || errCap.message || "Unknown error"
        if (errLower.code) tableErrorMsg += ` [Code: ${errLower.code}]`
        if (errLower.hint) tableErrorMsg += ` (Hint: ${errLower.hint})`
      }
    }

    const elapsed = Math.round(performance.now() - startTime)

    const statusParts: string[] = []
    if (bucketFound) {
      statusParts.push(`Storage bucket '${config.bucketName}' is active`)
    } else {
      statusParts.push(
        `Bucket '${config.bucketName}' was not found (ensure it's created and Public in Supabase Storage)`,
      )
    }

    if (tableFound) {
      statusParts.push(`Database table '${activeTable}' is connected and ready`)
    } else if (
      tableErrorMsg.toLowerCase().includes("policy") ||
      tableErrorMsg.toLowerCase().includes("permission")
    ) {
      statusParts.push(
        `Table '${activeTable}' exists, but permission was denied (${tableErrorMsg}). Run the SQL snippet below to grant permissions and RLS policies`,
      )
    } else {
      statusParts.push(
        `Database table '${activeTable}' reported: "${tableErrorMsg}". If you already created it, run the SQL snippet below in SQL Editor to grant permissions and reload PostgREST cache`,
      )
    }

    return {
      success: true,
      message: `Connected to Supabase (${elapsed}ms)! ${statusParts.join(". ")}.`,
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
): Promise<{ success: boolean count: number error?: string }> {
  const client = getSupabaseClient(config)
  if (!client) {
    return {
      success: false,
      count: 0,
      error: "Supabase client is not configured.",
    }
  }

  try {
    // 1. Format matching the exact Supabase table schema (with buy_price and current_price)
    const payloadWithBuyPrice = products.map((p) => {
      const current = p.current_price || p.price || "₹0"
      const buy = p.buy_price || p.price || current

      return {
        id: String(p.id),
        title: p.title,
        designer: p.designer,
        buy_price: buy,
        current_price: current,
        rent: p.rent || "₹0",
        tag: p.tag || "Bridal",
        available: p.available ?? true,
        img: p.img,
        thumbnail: p.thumbnail || "",
        images: p.images && p.images.length > 0 ? p.images : [p.img],
        description: p.description || "",
        sku: p.sku || "",
        color: p.color || "",
        fabric: p.fabric || "",
        size: p.size || "",
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    let activeTable = "products"
    let { error: err1 } = await client
      .from("products")
      .upsert(payloadWithBuyPrice, { onConflict: "id" })

    // If table doesn't have images column, remove images and retry
    if (err1 && err1.message?.toLowerCase().includes("images")) {
      const payloadNoImages = payloadWithBuyPrice.map(
        ({ images: _imgs, ...rest }) => rest,
      )
      const resRetry = await client
        .from(activeTable)
        .upsert(payloadNoImages, { onConflict: "id" })
      if (!resRetry.error) {
        return { success: true, count: products.length }
      }
      err1 = resRetry.error
    }

    // Check if table 'products' was not found, try capitalized 'Products'
    if (
      err1 &&
      (err1.code === "PGRST205" ||
        err1.code === "42P01" ||
        err1.message?.toLowerCase().includes("not find") ||
        err1.message?.toLowerCase().includes("does not exist"))
    ) {
      const resCap = await client
        .from("Products")
        .upsert(payloadWithBuyPrice, { onConflict: "id" })

      if (!resCap.error) {
        return { success: true, count: products.length }
      }
      activeTable = "Products"
      err1 = resCap.error
    }

    if (!err1) {
      return { success: true, count: products.length }
    }

    // 2. If the table doesn't have buy_price / current_price columns, fallback to price
    if (
      err1.message?.toLowerCase().includes("buy_price") ||
      err1.message?.toLowerCase().includes("current_price")
    ) {
      const payloadWithPrice = products.map((p) => ({
        id: String(p.id),
        title: p.title,
        designer: p.designer,
        price: p.current_price || p.price || "₹0",
        rent: p.rent || "₹0",
        tag: p.tag || "Bridal",
        available: p.available ?? true,
        img: p.img,
        thumbnail: p.thumbnail || "",
        description: p.description || "",
        sku: p.sku || "",
        color: p.color || "",
        fabric: p.fabric || "",
        size: p.size || "",
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: err2 } = await client
        .from(activeTable)
        .upsert(payloadWithPrice, { onConflict: "id" })

      if (!err2) {
        return { success: true, count: products.length }
      }

      console.warn("Supabase products sync error:", err2.message)
      return { success: false, count: 0, error: err2.message }
    }

    console.warn("Supabase products sync error:", err1.message)
    return { success: false, count: 0, error: err1.message }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Database sync error"
    console.warn("Supabase products sync exception:", msg)
    return { success: false, count: 0, error: msg }
  }
}

/**
 * Delete a product from Supabase DB table `products`
 */
export async function deleteProductFromSupabase(
  id: string | number,
  config?: SupabaseConfig,
): Promise<boolean> {
  const client = getSupabaseClient(config)
  if (!client) return false

  try {
    let { error } = await client.from("products").delete().eq("id", String(id))

    if (
      error &&
      (error.code === "PGRST205" ||
        error.message?.toLowerCase().includes("not find"))
    ) {
      const capRes = await client.from("Products").delete().eq("id", String(id))
      error = capRes.error
    }

    if (error) {
      console.warn("Supabase delete product error:", error.message)
      return false
    }
    return true
  } catch {
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
    let { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (
      error &&
      (error.code === "PGRST205" ||
        error.message?.toLowerCase().includes("not find"))
    ) {
      const capRes = await client
        .from("Products")
        .select("*")
        .order("created_at", { ascending: false })
      if (!capRes.error && capRes.data) {
        data = capRes.data
        error = null
      }
    }

    if (error || !data) return null

    return data.map((item) => {
      const current = item.current_price || item.price || item.buy_price || "₹0"
      const buy = item.buy_price || item.price || current

      return {
        id: item.id,
        title: item.title,
        designer: item.designer,
        price: current,
        buy_price: buy,
        current_price: current,
        rent: item.rent || "₹0",
        tag: item.tag || "Bridal",
        available: Boolean(item.available),
        img: item.img,
        thumbnail: item.thumbnail || "",
        images: Array.isArray(item.images)
          ? item.images
          : item.img
            ? [item.img]
            : [],
        description: item.description || "",
        sku: item.sku || "",
        color: item.color || "",
        fabric: item.fabric || "",
        size: item.size || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }
    })
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
