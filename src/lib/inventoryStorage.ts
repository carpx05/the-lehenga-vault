import { Product } from "../types"

const DB_NAME = "LehengaVaultDB"
const STORE_NAME = "inventory"
const DB_VERSION = 1

function openInventoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not supported in this environment"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveCatalogToIndexedDB(
  products: Product[],
): Promise<void> {
  try {
    const db = await openInventoryDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(products, "products_catalog")

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn("IndexedDB save failed:", err)
  }
}

export async function getCatalogFromIndexedDB(): Promise<Product[] | null> {
  try {
    const db = await openInventoryDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get("products_catalog")

      req.onsuccess = () => {
        const result = req.result
        if (Array.isArray(result) && result.length > 0) {
          resolve(result)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}
