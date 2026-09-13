import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { Product } from "../types"
import {
  getSavedSupabaseConfig,
  syncProductsToSupabase,
  syncSingleProductToSupabase,
  fetchProductsFromSupabase,
  deleteProductFromSupabase,
} from "../lib/supabase"
import {
  saveCatalogToIndexedDB,
  getCatalogFromIndexedDB,
} from "../lib/inventoryStorage"

const STORAGE_KEY = "lehenga_vault_inventory_v1"

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Crimson Heirloom",
    designer: "Tarun Tahiliani",
    price: "₹68,000",
    buy_price: "₹85,000",
    current_price: "₹68,000",
    rent: "₹8,500",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Intricately hand-embroidered raw silk lehenga featuring zardozi and antique dabka work. Paired with dual dupattas.",
    sku: "LV-BR-001",
    color: "Deep Crimson Red",
    fabric: "Raw Silk & Organza",
    size: "M (Customizable)",
  },
  {
    id: 2,
    title: "Golden Hour",
    designer: "Anita Dongre",
    price: "₹55,000",
    buy_price: "₹65,000",
    current_price: "₹55,000",
    rent: "₹6,500",
    tag: "Indo-Western",
    available: true,
    img: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Contemporary metallic champagne lehenga with gota patti detailing and modern cape silhouette.",
    sku: "LV-IW-002",
    color: "Sunlit Gold & Champagne",
    fabric: "Tissue Chiffon",
    size: "S / M",
  },
  {
    id: 3,
    title: "Pearl & Zari",
    designer: "Sabyasachi",
    price: "₹1,20,000",
    buy_price: "₹1,20,000",
    current_price: "₹1,20,000",
    rent: "₹14,000",
    tag: "Bridal",
    available: false,
    img: "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Royal heirloom velvet lehenga with fine micro-pearl embellishments and gold beaten wire craftsmanship.",
    sku: "LV-BR-003",
    color: "Imperial Ruby",
    fabric: "Royal Velvet",
    size: "L",
  },
  {
    id: 4,
    title: "Ivory & Golds",
    designer: "Manish Malhotra",
    price: "₹88,000",
    buy_price: "₹88,000",
    current_price: "₹88,000",
    rent: "₹10,500",
    tag: "Reception",
    available: true,
    img: "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Sequinned geometric trailing lehenga designed for evening glamour and red-carpet receptions.",
    sku: "LV-RC-004",
    color: "Ivory Shimmer",
    fabric: "Georgette & Net",
    size: "M",
  },
  {
    id: 5,
    title: "Rose Mist",
    designer: "Rimple & Harpreet",
    price: "₹42,000",
    buy_price: "₹48,000",
    current_price: "₹42,000",
    rent: "₹5,200",
    tag: "Festive",
    available: true,
    img: "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Pastel dusty rose ensemble with intricate Kashmiri tilla embroidery and floral motifs.",
    sku: "LV-FE-005",
    color: "Dusty Rose",
    fabric: "Pure Silk",
    size: "S / M / L",
  },
  {
    id: 6,
    title: "Midnight Dusk",
    designer: "Tarun Tahiliani",
    price: "₹76,000",
    buy_price: "₹76,000",
    current_price: "₹76,000",
    rent: "₹9,200",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1677691257363-eebd2abeafec?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1677691257363-eebd2abeafec?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Deep navy and midnight teal lehenga with crystal threadwork and structured can-can flare.",
    sku: "LV-BR-006",
    color: "Midnight Blue",
    fabric: "Italian Silk",
    size: "M / L",
  },
  {
    id: 7,
    title: "Desert Sand",
    designer: "Anita Dongre",
    price: "₹38,000",
    buy_price: "₹38,000",
    current_price: "₹38,000",
    rent: "₹4,800",
    tag: "Indo-Western",
    available: true,
    img: "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Lightweight sustainable silk lehenga with Rajasthani marodi work and breathable lining.",
    sku: "LV-IW-007",
    color: "Sand Ochre",
    fabric: "Raw Silk",
    size: "S / M",
  },
  {
    id: 8,
    title: "Saffron Bloom",
    designer: "Falguni Shane Peacock",
    price: "₹95,000",
    buy_price: "₹1,15,000",
    current_price: "₹95,000",
    rent: "₹11,800",
    tag: "Reception",
    available: false,
    img: "https://images.unsplash.com/photo-1740674570259-a47d713a2976?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1740674570259-a47d713a2976?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "High-drama feathered and beaded reception lehenga with sweeping train and sheer bustier.",
    sku: "LV-RC-008",
    color: "Warm Saffron",
    fabric: "Organza & Tulle",
    size: "M",
  },
  {
    id: 9,
    title: "Emerald Whisper",
    designer: "Sabyasachi",
    price: "₹1,45,000",
    buy_price: "₹1,45,000",
    current_price: "₹1,45,000",
    rent: "₹16,500",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1677691257363-eebd2abeafec?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Masterpiece forest emerald green bridal lehenga encrusted with uncut gems and heirloom zardozi.",
    sku: "LV-BR-009",
    color: "Forest Emerald",
    fabric: "Royal Silk Velvet",
    size: "Free Size (Adjustable)",
  },
  {
    id: 10,
    title: "Noor-e-Kashmir",
    designer: "Ritu Kumar",
    price: "₹78,000",
    buy_price: "₹88,000",
    current_price: "₹78,000",
    rent: "₹8,900",
    tag: "Festive",
    available: true,
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1740674570259-a47d713a2976?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Hand-spun chanderi lehenga adorned with traditional Kashmiri tilla craft and antique sequin borders.",
    sku: "LV-FE-010",
    color: "Mulberry Rust",
    fabric: "Chanderi Silk",
    size: "S / M",
  },
  {
    id: 11,
    title: "Celestial Shimmer",
    designer: "Manish Malhotra",
    price: "₹1,15,000",
    buy_price: "₹1,35,000",
    current_price: "₹1,15,000",
    rent: "₹13,500",
    tag: "Reception",
    available: true,
    img: "https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Dramatic architectural trail lehenga with reflective gunmetal sequins and sheer structured corset.",
    sku: "LV-RC-011",
    color: "Liquid Platinum",
    fabric: "Metallic Tulle",
    size: "M",
  },
  {
    id: 12,
    title: "Marigold Sunshine",
    designer: "Sabyasachi",
    price: "₹65,000",
    buy_price: "₹65,000",
    current_price: "₹65,000",
    rent: "₹7,800",
    tag: "Indo-Western",
    available: true,
    img: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&h=1100&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
    ],
    description:
      "Sun-kissed turmeric and marigold flared silhouette with hand-screened floral botanicals and gota edges.",
    sku: "LV-IW-012",
    color: "Marigold Gold",
    fabric: "Organza Silk",
    size: "Free Size",
  },
]

interface ProductContextType {
  products: Product[]
  isLoading: boolean
  addProduct: (
    product: Omit<Product, "id">,
  ) => Promise<{ product: Product; success: boolean; error?: string }>
  updateProduct: (
    id: string | number,
    updates: Partial<Product>,
  ) => Promise<{ success: boolean; error?: string }>
  deleteProduct: (id: string | number) => Promise<void>
  toggleAvailability: (id: string | number) => Promise<void>
  resetToDefault: () => void
  syncWithSupabase: () => Promise<{
    success: boolean
    count: number
    error?: string
  }>
  getProductById: (id: string | number) => Product | undefined
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => {
            const current = p.current_price || p.price || "₹0"
            const buy = p.buy_price || p.price || current
            const seedMatch = INITIAL_PRODUCTS.find(
              (ip) => String(ip.id) === String(p.id),
            )

            // Purge any stale, dead blob: URLs from previous sessions
            const rawImages = Array.isArray(p.images) ? p.images : []
            const validImages = rawImages.filter(
              (url: string) =>
                typeof url === "string" && !url.startsWith("blob:"),
            )

            let coverImg = p.img
            if (!coverImg || coverImg.startsWith("blob:")) {
              coverImg = validImages[0] || seedMatch?.img || p.img
            }

            const images =
              validImages.length > 0
                ? validImages
                : coverImg
                  ? [coverImg]
                  : seedMatch?.images || []

            return {
              ...p,
              img: coverImg,
              price: current,
              buy_price: buy,
              current_price: current,
              images,
            }
          })
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS
  })

  const [isLoading, setIsLoading] = useState(false)

  // Persist to local storage and IndexedDB whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch {
      // storage quota
    }
    // Also save to IndexedDB as permanent storage without quota limits
    saveCatalogToIndexedDB(products).catch(() => {})
  }, [products])

  // Hydrate from IndexedDB and attempt background sync with Supabase
  useEffect(() => {
    let isMounted = true
    let cloudHydrated = false

    // 1. Check IndexedDB for any catalogs saved beyond localStorage quota
    getCatalogFromIndexedDB().then((idbProducts) => {
      // If cloud has already hydrated, do not downgrade with local IndexedDB
      if (isMounted && !cloudHydrated && idbProducts && idbProducts.length > 0) {
        setProducts((current) => {
          return idbProducts.map((ip) => {
            const rawImgs = Array.isArray(ip.images) ? ip.images : []
            const validImgs = rawImgs.filter(
              (u: string) => typeof u === "string" && !u.startsWith("blob:"),
            )
            return {
              ...ip,
              images:
                validImgs.length > 0
                  ? validImgs
                  : ip.img
                    ? [ip.img]
                    : [],
            }
          })
        })
      }
    })

    // 2. Background sync with Supabase cloud database (authoritative source of truth)
    const config = getSavedSupabaseConfig()
    if (config.url && config.anonKey) {
      fetchProductsFromSupabase(config).then((cloudProducts) => {
        if (isMounted && cloudProducts && cloudProducts.length > 0) {
          cloudHydrated = true
          setProducts((currentProducts) => {
            const cloudIds = new Set(cloudProducts.map((cp) => String(cp.id)))
            // Preserve newly created local products that have not yet reached the cloud
            const localPending = currentProducts.filter(
              (lp) =>
                !cloudIds.has(String(lp.id)) && String(lp.id).startsWith("lv-"),
            )
            const merged = [...cloudProducts, ...localPending]
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
            } catch {}
            saveCatalogToIndexedDB(merged).catch(() => {})
            return merged
          })
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [])

  const addProduct = useCallback(
    async (
      newProductData: Omit<Product, "id">,
    ): Promise<{ product: Product; success: boolean; error?: string }> => {
      const newProduct: Product = {
        ...newProductData,
        id: `lv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setProducts((prev) => [newProduct, ...prev])

      // Fast single-product background sync to Supabase if credentials available
      const config = getSavedSupabaseConfig()
      if (config.url && config.anonKey && config.autoSync) {
        try {
          const syncRes = await syncSingleProductToSupabase(newProduct, config)
          return { product: newProduct, success: syncRes.success, error: syncRes.error }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Cloud sync failed"
          return { product: newProduct, success: false, error: msg }
        }
      }

      return { product: newProduct, success: true }
    },
    [],
  )

  const updateProduct = useCallback(
    async (
      id: string | number,
      updates: Partial<Product>,
    ): Promise<{ success: boolean; error?: string }> => {
      let targetProduct: Product | null = null

      setProducts((prev) => {
        return prev.map((item) => {
          if (String(item.id) === String(id)) {
            targetProduct = {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
            return targetProduct
          }
          return item
        })
      })

      const config = getSavedSupabaseConfig()
      if (config.url && config.anonKey && config.autoSync && targetProduct) {
        try {
          const res = await syncSingleProductToSupabase(targetProduct, config)
          return res
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Sync failed"
          return { success: false, error: msg }
        }
      }
      return { success: true }
    },
    [],
  )

  const deleteProduct = useCallback(async (id: string | number) => {
    setProducts((prev) => {
      const updated = prev.filter((item) => String(item.id) !== String(id))
      const config = getSavedSupabaseConfig()
      if (config.url && config.anonKey) {
        deleteProductFromSupabase(id, config).catch(console.warn)
      }
      return updated
    })
  }, [])

  const toggleAvailability = useCallback(async (id: string | number) => {
    let targetProduct: Product | null = null
    setProducts((prev) => {
      return prev.map((item) => {
        if (String(item.id) === String(id)) {
          targetProduct = { ...item, available: !item.available }
          return targetProduct
        }
        return item
      })
    })

    const config = getSavedSupabaseConfig()
    if (config.url && config.anonKey && config.autoSync && targetProduct) {
      syncSingleProductToSupabase(targetProduct, config).catch(console.warn)
    }
  }, [])

  const resetToDefault = useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS))
    saveCatalogToIndexedDB(INITIAL_PRODUCTS).catch(() => {})
  }, [])

  const syncWithSupabase = useCallback(async () => {
    setIsLoading(true)
    const config = getSavedSupabaseConfig()
    try {
      const res = await syncProductsToSupabase(products, config)
      setIsLoading(false)
      return res
    } catch (err: unknown) {
      setIsLoading(false)
      const msg = err instanceof Error ? err.message : "Database sync error"
      return { success: false, count: 0, error: msg }
    }
  }, [products])

  const getProductById = useCallback(
    (id: string | number) => products.find((p) => String(p.id) === String(id)),
    [products],
  )

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        resetToDefault,
        syncWithSupabase,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
