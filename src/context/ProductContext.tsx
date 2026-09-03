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
  fetchProductsFromSupabase,
} from "../lib/supabase"

const STORAGE_KEY = "lehenga_vault_inventory_v1"

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Crimson Heirloom",
    designer: "Tarun Tahiliani",
    price: "₹68,000",
    rent: "₹8,500",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹6,500",
    tag: "Indo-Western",
    available: true,
    img: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹14,000",
    tag: "Bridal",
    available: false,
    img: "https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹10,500",
    tag: "Reception",
    available: true,
    img: "https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹5,200",
    tag: "Festive",
    available: true,
    img: "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹9,200",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1677691257363-eebd2abeafec?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹4,800",
    tag: "Indo-Western",
    available: true,
    img: "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹11,800",
    tag: "Reception",
    available: false,
    img: "https://images.unsplash.com/photo-1740674570259-a47d713a2976?w=800&h=1100&fit=crop&auto=format",
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
    rent: "₹16,500",
    tag: "Bridal",
    available: true,
    img: "https://images.unsplash.com/photo-1707576618343-26a1b377ca7a?w=800&h=1100&fit=crop&auto=format",
    description:
      "Masterpiece forest emerald green bridal lehenga encrusted with uncut gems and heirloom zardozi.",
    sku: "LV-BR-009",
    color: "Forest Emerald",
    fabric: "Royal Silk Velvet",
    size: "Free Size (Adjustable)",
  },
]

interface ProductContextType {
  products: Product[]
  isLoading: boolean
  addProduct: (product: Omit<Product, "id">) => Promise<Product>
  updateProduct: (
    id: string | number,
    updates: Partial<Product>,
  ) => Promise<void>
  deleteProduct: (id: string | number) => Promise<void>
  toggleAvailability: (id: string | number) => Promise<void>
  resetToDefault: () => void
  syncWithSupabase: () => Promise<{ success: boolean count: number }>
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
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS
  })

  const [isLoading, setIsLoading] = useState(false)

  // Persist to local storage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch {
      // storage quota
    }
  }, [products])

  // Attempt background sync with Supabase if configured
  useEffect(() => {
    const config = getSavedSupabaseConfig()
    if (config.isConnected && config.url && config.anonKey) {
      fetchProductsFromSupabase(config).then((cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts)
        }
      })
    }
  }, [])

  const addProduct = useCallback(
    async (newProductData: Omit<Product, "id">): Promise<Product> => {
      const newProduct: Product = {
        ...newProductData,
        id: `lv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setProducts((prev) => [newProduct, ...prev])

      // Background sync to Supabase if enabled
      const config = getSavedSupabaseConfig()
      if (config.isConnected && config.autoSync) {
        syncProductsToSupabase([newProduct, ...products], config).catch(
          console.warn,
        )
      }

      return newProduct
    },
    [products],
  )

  const updateProduct = useCallback(
    async (id: string | number, updates: Partial<Product>) => {
      setProducts((prev) => {
        const updated = prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item,
        )

        const config = getSavedSupabaseConfig()
        if (config.isConnected && config.autoSync) {
          syncProductsToSupabase(updated, config).catch(console.warn)
        }
        return updated
      })
    },
    [],
  )

  const deleteProduct = useCallback(async (id: string | number) => {
    setProducts((prev) => {
      const updated = prev.filter((item) => String(item.id) !== String(id))
      const config = getSavedSupabaseConfig()
      if (config.isConnected && config.autoSync) {
        syncProductsToSupabase(updated, config).catch(console.warn)
      }
      return updated
    })
  }, [])

  const toggleAvailability = useCallback(async (id: string | number) => {
    setProducts((prev) => {
      const updated = prev.map((item) =>
        String(item.id) === String(id)
          ? { ...item, available: !item.available }
          : item,
      )
      const config = getSavedSupabaseConfig()
      if (config.isConnected && config.autoSync) {
        syncProductsToSupabase(updated, config).catch(console.warn)
      }
      return updated
    })
  }, [])

  const resetToDefault = useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS))
  }, [])

  const syncWithSupabase = useCallback(async () => {
    setIsLoading(true)
    const config = getSavedSupabaseConfig()
    try {
      const ok = await syncProductsToSupabase(products, config)
      setIsLoading(false)
      return { success: ok, count: products.length }
    } catch {
      setIsLoading(false)
      return { success: false, count: 0 }
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
