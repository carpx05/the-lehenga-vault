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

    // Check if 'images' column exists
    let imagesColFound = false
    if (tableFound) {
      const { error: errCol } = await client
        .from(activeTable)
        .select("id, images")
        .limit(1)
      if (!errCol) {
        imagesColFound = true
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
      if (imagesColFound) {
        statusParts.push(`Database table '${activeTable}' connected with native 'images' gallery column`)
      } else {
        statusParts.push(
          `Database table '${activeTable}' connected (Note: 'images' column not detected in DB table yet; automatic description-trailer fallback is active, or run migration in SQL Editor for native column)`,
        )
      }
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
 * Robust parser for product images from Supabase.
 * Handles Postgres TEXT[] arrays, JSONB arrays, stringified JSON arrays ('["..."]'),
 * Postgres array string literals ('{"..."}'), and comma-separated URL lists.
 */
export function parseImages(rawImages: unknown, fallbackImg?: string): string[] {
  let list: string[] = []

  if (Array.isArray(rawImages)) {
    list = rawImages.filter((u): u is string => typeof u === "string")
  } else if (typeof rawImages === "string" && rawImages.trim()) {
    const trimmed = rawImages.trim()
    // 1. JSON array string: '["https://...", "https://..."]'
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          list = parsed.filter((u): u is string => typeof u === "string")
        }
      } catch {
        // ignore
      }
    }
    // 2. Postgres array literal: '{"https://...","https://..."}'
    if (list.length === 0 && trimmed.startsWith("{") && trimmed.endsWith("}")) {
      list = trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.replace(/^"|"$/g, "").trim())
        .filter(Boolean)
    }
    // 3. Comma-separated URLs
    if (list.length === 0 && trimmed.includes("http")) {
      list = trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }
    // 4. Single URL string
    if (
      list.length === 0 &&
      (trimmed.startsWith("http") || trimmed.startsWith("/") || trimmed.startsWith("data:"))
    ) {
      list = [trimmed]
    }
  }

  // Filter out empty strings and invalid/dead blob URLs
  const valid = list
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && !u.startsWith("blob:"))

  if (valid.length > 0) {
    return Array.from(new Set(valid))
  }

  if (fallbackImg && typeof fallbackImg === "string" && !fallbackImg.startsWith("blob:")) {
    return [fallbackImg.trim()]
  }

  return []
}

/**
 * Parses a raw database row from Supabase products table into a Product object.
 * Extracts multiple images from native 'images' column or embedded description trailer.
 */
export function parseProductFromSupabase(item: any): Product {
  const current = item.current_price || item.price || item.buy_price || "₹0"
  const buy = item.buy_price || item.price || current

  let cleanDescription = (item.description || "").trim()
  let trailerImages: string[] = []

  // Check for embedded gallery metadata trailer in description
  const trailerMatch = cleanDescription.match(/<!--lv_gallery:(.*?)-->/s)
  if (trailerMatch) {
    try {
      const parsed = JSON.parse(trailerMatch[1])
      if (Array.isArray(parsed) && parsed.length > 0) {
        trailerImages = parsed.filter(
          (u): u is string => typeof u === "string" && !u.startsWith("blob:"),
        )
      }
    } catch {
      // ignore
    }
    // Strip metadata trailer so UI only renders clean description
    cleanDescription = cleanDescription.replace(/<!--lv_gallery:.*?-->/gs, "").trim()
  }

  // Parse images from item.images (whether array, json, or text)
  let gallery = parseImages(item.images, item.img)

  // If item.images column had only 1 image (or was null because column was missing),
  // but description trailer had multiple angles, restore from trailer
  if (gallery.length <= 1 && trailerImages.length > 1) {
    gallery = trailerImages
  }

  const coverImg =
    item.img && !item.img.startsWith("blob:") ? item.img : gallery[0] || ""

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
    img: coverImg,
    images: gallery.length > 0 ? gallery : coverImg ? [coverImg] : [],
    thumbnail: item.thumbnail || "",
    description: cleanDescription,
    sku: item.sku || "",
    color: item.color || "",
    fabric: item.fabric || "",
    size: item.size || "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

/**
 * Formats a Product for Supabase DB upsert.
 * Safely prepares images array and embeds a non-intrusive metadata trailer in description.
 * This guarantees zero loss of multiple angles even if the database has not yet added 'images TEXT[]'.
 */
export function formatProductForSupabase(p: Product): Record<string, any> {
  const current = p.current_price || p.price || "₹0"
  const buy = p.buy_price || p.price || current

  const rawImgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.img ? [p.img] : []
  const cleanImages = rawImgs.filter(
    (u): u is string => typeof u === "string" && u.trim().length > 0 && !u.startsWith("blob:"),
  )

  const coverImg = p.img && !p.img.startsWith("blob:") ? p.img : cleanImages[0] || ""
  const finalImages = cleanImages.length > 0 ? cleanImages : coverImg ? [coverImg] : []

  // Ensure primary cover is first in gallery array
  const orderedImages = [
    coverImg,
    ...finalImages.filter((u) => u !== coverImg),
  ].filter(Boolean)

  let desc = (p.description || "").trim()
  // Clean existing trailer
  desc = desc.replace(/<!--lv_gallery:.*?-->/gs, "").trim()
  if (orderedImages.length > 1) {
    desc = `${desc}\n<!--lv_gallery:${JSON.stringify(orderedImages)}-->`.trim()
  }

  return {
    id: String(p.id),
    title: p.title,
    designer: p.designer,
    buy_price: buy,
    current_price: current,
    price: current,
    rent: p.rent || "₹0",
    tag: p.tag || "Bridal",
    available: p.available ?? true,
    img: coverImg,
    images: orderedImages,
    thumbnail: p.thumbnail || "",
    description: desc,
    sku: p.sku || "",
    color: p.color || "",
    fabric: p.fabric || "",
    size: p.size || "",
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

  // Unique random token prevents filename collisions during batch uploads
  const rand = Math.random().toString(36).substring(2, 8)
  const cleanBase = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const cleanName = `${Date.now()}-${rand}-${cleanBase}`
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
 * Sync a single product to Supabase DB table `products`
 * Provides fast, sub-50ms writes, isolated error handling, and robust multi-tier fallback:
 * Tier 1: Upsert with native images array (Postgres TEXT[] or JSONB)
 * Tier 2: Upsert with JSON-stringified images if column is TEXT
 * Tier 3: Upsert with description metadata trailer fallback if 'images' column is absent
 */
export async function syncSingleProductToSupabase(
  product: Product,
  config?: SupabaseConfig,
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient(config)
  if (!client) {
    return {
      success: false,
      error: "Supabase client is not configured.",
    }
  }

  try {
    const formatted = formatProductForSupabase(product)
    let activeTable = "products"

    // 1. Try upsert with native images array
    let { error } = await client
      .from(activeTable)
      .upsert(formatted, { onConflict: "id" })

    // Check table casing ONLY if the table itself was reported missing (never on column or schema cache errors)
    if (
      error &&
      (error.message?.toLowerCase().includes("find the table") ||
        error.message?.toLowerCase().includes("relation \"products\" does not exist"))
    ) {
      const resCap = await client
        .from("Products")
        .upsert(formatted, { onConflict: "id" })
      if (!resCap.error) {
        activeTable = "Products"
        error = null
      }
    }

    // 2. If error is about images column type, missing column, or PostgREST schema cache
    if (
      error &&
      (error.message?.toLowerCase().includes("images") ||
        error.message?.toLowerCase().includes("schema cache") ||
        error.message?.toLowerCase().includes("column"))
    ) {
      // 2a. Try stringified JSON for images (in case images is TEXT)
      const payloadStringified = {
        ...formatted,
        images: JSON.stringify(formatted.images),
      }
      const resJson = await client
        .from(activeTable)
        .upsert(payloadStringified, { onConflict: "id" })

      if (!resJson.error) {
        return { success: true }
      }

      // 2b. If column doesn't exist at all or PostgREST schema cache hasn't refreshed, omit images column
      // Note: formatProductForSupabase already embedded the <!--lv_gallery:...--> trailer into description!
      const { images: _omitted, ...payloadNoImages } = formatted
      const resNoImages = await client
        .from(activeTable)
        .upsert(payloadNoImages, { onConflict: "id" })

      if (!resNoImages.error) {
        return { success: true }
      }
      error = resNoImages.error
    }

    // 3. Fallback if buy_price or current_price columns don't exist
    if (
      error &&
      (error.message?.toLowerCase().includes("buy_price") ||
        error.message?.toLowerCase().includes("current_price"))
    ) {
      const { buy_price: _b, current_price: _c, ...fallbackPayload } = formatted
      const resPrice = await client
        .from(activeTable)
        .upsert(fallbackPayload, { onConflict: "id" })
      if (!resPrice.error) {
        return { success: true }
      }
      error = resPrice.error
    }

    if (error) {
      console.warn("Supabase single product sync error:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Database sync error"
    console.warn("Supabase single product sync exception:", msg)
    return { success: false, error: msg }
  }
}

/**
 * Sync all products to Supabase DB table `products` (cloud mirror)
 */
export async function syncProductsToSupabase(
  products: Product[],
  config?: SupabaseConfig,
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient(config)
  if (!client) {
    return {
      success: false,
      count: 0,
      error: "Supabase client is not configured.",
    }
  }

  try {
    const formattedList = products.map(formatProductForSupabase)
    let activeTable = "products"

    let { error: err1 } = await client
      .from(activeTable)
      .upsert(formattedList, { onConflict: "id" })

    // Check table casing ONLY if the table itself was reported missing (never on column or schema cache errors)
    if (
      err1 &&
      (err1.message?.toLowerCase().includes("find the table") ||
        err1.message?.toLowerCase().includes("relation \"products\" does not exist"))
    ) {
      const resCap = await client
        .from("Products")
        .upsert(formattedList, { onConflict: "id" })
      if (!resCap.error) {
        activeTable = "Products"
        err1 = null
      }
    }

    // If table complains about images column type, missing column, or PostgREST schema cache
    if (
      err1 &&
      (err1.message?.toLowerCase().includes("images") ||
        err1.message?.toLowerCase().includes("schema cache") ||
        err1.message?.toLowerCase().includes("column"))
    ) {
      // Try stringifying images array
      const listStringified = formattedList.map((item) => ({
        ...item,
        images: JSON.stringify(item.images),
      }))
      const resJson = await client
        .from(activeTable)
        .upsert(listStringified, { onConflict: "id" })

      if (!resJson.error) {
        return { success: true, count: products.length }
      }

      // If column is completely missing or cache not refreshed, omit images column (description-trailer fallback active)
      const listNoImages = formattedList.map(({ images: _imgs, ...rest }) => rest)
      const resNoImages = await client
        .from(activeTable)
        .upsert(listNoImages, { onConflict: "id" })

      if (!resNoImages.error) {
        return { success: true, count: products.length }
      }
      err1 = resNoImages.error
    }

    if (!err1) {
      return { success: true, count: products.length }
    }

    // Fallback if table doesn't have buy_price / current_price columns
    if (
      err1.message?.toLowerCase().includes("buy_price") ||
      err1.message?.toLowerCase().includes("current_price")
    ) {
      const listLegacy = formattedList.map(({ buy_price: _b, current_price: _c, ...rest }) => rest)
      const { error: err2 } = await client
        .from(activeTable)
        .upsert(listLegacy, { onConflict: "id" })

      if (!err2) {
        return { success: true, count: products.length }
      }
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
      (error.message?.toLowerCase().includes("find the table") ||
        error.message?.toLowerCase().includes("relation \"products\" does not exist"))
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
    let activeTable = "products"
    let { data, error } = await client
      .from(activeTable)
      .select("*")
      .order("created_at", { ascending: false })

    if (
      error &&
      (error.message?.toLowerCase().includes("find the table") ||
        error.message?.toLowerCase().includes("relation \"products\" does not exist"))
    ) {
      const capRes = await client
        .from("Products")
        .select("*")
        .order("created_at", { ascending: false })
      if (!capRes.error && capRes.data) {
        activeTable = "Products"
        data = capRes.data
        error = null
      }
    }

    // Fallback if 'created_at' column does not exist in user's schema
    if (error && error.message?.toLowerCase().includes("created_at")) {
      const noOrderRes = await client.from(activeTable).select("*")
      if (!noOrderRes.error && noOrderRes.data) {
        data = noOrderRes.data
        error = null
      }
    }

    if (error) {
      console.warn("fetchProductsFromSupabase notice:", error.message)
      return null
    }

    if (!data) return null

    return data.map(parseProductFromSupabase)
  } catch (err) {
    console.warn("fetchProductsFromSupabase exception:", err)
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
