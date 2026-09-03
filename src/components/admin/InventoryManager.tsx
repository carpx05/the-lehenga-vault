import React, { useState, useMemo } from "react"
import { useProducts } from "../../context/ProductContext"
import { Product } from "../../types"
import ProductModal from "./ProductModal"
import OptimizedImage from "../OptimizedImage"
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
} from "lucide-react"

export default function InventoryManager() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    resetToDefault,
  } = useProducts()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("All")
  const [availabilityFilter, setAvailabilityFilter] =
    useState<"All" | "Available" | "Rented">("All")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  // Filtered and searched list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchTag = selectedTag === "All" || p.tag === selectedTag

      const matchAvail =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && p.available) ||
        (availabilityFilter === "Rented" && !p.available)

      return matchSearch && matchTag && matchAvail
    })
  }, [products, searchQuery, selectedTag, availabilityFilter])

  // Summary counts
  const totalCount = products.length
  const availableCount = products.filter((p) => p.available).length
  const rentedCount = totalCount - availableCount
  const uniqueDesigners = new Set(products.map((p) => p.designer)).size

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (
    productData: Omit<Product, "id"> | Product,
  ) => {
    if ("id" in productData && productData.id) {
      await updateProduct(productData.id, productData)
      showNotification(`Updated "${productData.title}" successfully.`)
    } else {
      await addProduct(productData)
      showNotification(`Added "${productData.title}" to inventory.`)
    }
  }

  const handleDeleteConfirm = async (id: string | number) => {
    await deleteProduct(id)
    setDeletingId(null)
    showNotification("Product removed from vault inventory.")
  }

  const handleToggle = async (p: Product) => {
    await toggleAvailability(p.id)
    showNotification(`Status updated for "${p.title}".`)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2418] text-[#FAF6ED] border border-[#C9A84C] px-5 py-3 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          <span className="text-xs tracking-wider">{notification}</span>
        </div>
      )}

      {/* Top Banner with Stats & Add Button */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-semibold">
              Live Vault Catalog
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#2D2418] font-semibold">
              Product Inventory & Availability
            </h2>
            <p className="text-xs text-[#5C3D1E] mt-1">
              Add new bridal lehengas, adjust rental rates, swap high-res
              photography, and update booking status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-3 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-xs font-semibold uppercase tracking-widest transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Lehenga
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#D4C4A0]">
          <div className="bg-[#EDE3CC]/60 p-3.5 border border-[#D4C4A0]">
            <p className="text-[10px] uppercase tracking-wider text-[#8B6A3E] font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C9A84C]" /> Total Pieces
            </p>
            <p className="font-serif text-2xl font-semibold text-[#2D2418] mt-1">
              {totalCount}
            </p>
          </div>

          <div className="bg-[#EDE3CC]/60 p-3.5 border border-[#D4C4A0]">
            <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
              Available in Atelier
            </p>
            <p className="font-serif text-2xl font-semibold text-emerald-900 mt-1">
              {availableCount}
            </p>
          </div>

          <div className="bg-[#EDE3CC]/60 p-3.5 border border-[#D4C4A0]">
            <p className="text-[10px] uppercase tracking-wider text-amber-800 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Currently
              Rented Out
            </p>
            <p className="font-serif text-2xl font-semibold text-amber-900 mt-1">
              {rentedCount}
            </p>
          </div>

          <div className="bg-[#EDE3CC]/60 p-3.5 border border-[#D4C4A0]">
            <p className="text-[10px] uppercase tracking-wider text-[#8B6A3E] font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8B6A3E]" /> Designer Labels
            </p>
            <p className="font-serif text-2xl font-semibold text-[#2D2418] mt-1">
              {uniqueDesigners}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8B6A3E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, designer, SKU..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-xs text-[#2D2418] placeholder-[#8B6A3E] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-[#8B6A3E]">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {["All", "Bridal", "Indo-Western", "Festive", "Reception"].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-all border ${
                  selectedTag === tag
                    ? "bg-[#2D2418] text-[#FAF6ED] border-[#2D2418]"
                    : "border-[#D4C4A0] text-[#5C3D1E] hover:border-[#C9A84C]"
                }`}
              >
                {tag}
              </button>
            ),
          )}

          {/* Availability Filter */}
          <select
            value={availabilityFilter}
            onChange={(e) =>
              setAvailabilityFilter(
                e.target.value as "All" | "Available" | "Rented",
              )
            }
            className="ml-2 px-3 py-1 bg-[#FAF6ED] border border-[#D4C4A0] text-xs text-[#2D2418] focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Available">Available Only</option>
            <option value="Rented">Rented Only</option>
          </select>

          {/* Table / Grid Toggle */}
          <div className="hidden sm:flex items-center ml-auto border border-[#D4C4A0] bg-[#EDE3CC]">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-[#2D2418] text-[#FAF6ED]"
                  : "text-[#8B6A3E]"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-[#2D2418] text-[#FAF6ED]"
                  : "text-[#8B6A3E]"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FAF6ED] border border-[#D4C4A0] p-12 text-center">
          <p className="font-serif text-lg text-[#2D2418]">
            No lehengas match your search query or filter.
          </p>
          <p className="text-xs text-[#8B6A3E] mt-1">
            Try clearing filters or search terms.
          </p>
          <button
            onClick={() => {
              setSearchQuery("")
              setSelectedTag("All")
              setAvailabilityFilter("All")
            }}
            className="mt-4 px-4 py-2 border border-[#2D2418] text-xs uppercase tracking-wider hover:bg-[#2D2418] hover:text-[#FAF6ED] transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#FAF6ED] border border-[#D4C4A0] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EDE3CC] border-b border-[#D4C4A0] text-[10px] uppercase tracking-wider text-[#5C3D1E] font-semibold">
                <th className="py-3.5 px-4">Piece</th>
                <th className="py-3.5 px-4">Designer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Buy Price</th>
                <th className="py-3.5 px-4">Rent Price</th>
                <th className="py-3.5 px-4 text-center">Availability Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE3CC] text-xs">
              {filteredProducts.map((piece) => (
                <tr
                  key={piece.id}
                  className="hover:bg-[#EDE3CC]/30 transition-colors group"
                >
                  {/* Image & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-none overflow-hidden bg-[#EDE3CC] flex-shrink-0 border border-[#D4C4A0]">
                        <OptimizedImage
                          src={piece.img}
                          thumbnail={piece.thumbnail}
                          alt={piece.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-semibold text-[#2D2418]">
                          {piece.title}
                        </p>
                        <p className="text-[10px] text-[#8B6A3E] font-mono">
                          {piece.sku || "LV-VAULT"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Designer */}
                  <td className="py-3 px-4 font-medium text-[#2D2418]">
                    {piece.designer}
                  </td>

                  {/* Tag */}
                  <td className="py-3 px-4">
                    <span className="inline-block text-[9px] uppercase tracking-widest px-2.5 py-0.5 bg-[#EDE3CC] text-[#2D2418] border border-[#D4C4A0]">
                      {piece.tag}
                    </span>
                  </td>

                  {/* Buy Price */}
                  <td className="py-3 px-4 font-serif text-sm font-medium text-[#2D2418]">
                    {piece.price}
                  </td>

                  {/* Rent Price */}
                  <td className="py-3 px-4 font-serif text-sm font-medium text-[#8B6A3E]">
                    {piece.rent}
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(piece)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border transition-all ${
                        piece.available
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          piece.available ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                      {piece.available ? "Available" : "Currently Rented"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(piece)}
                        className="p-1.5 text-[#5C3D1E] hover:text-[#C9A84C] hover:bg-[#EDE3CC] transition-colors"
                        title="Edit Piece"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(piece.id)}
                        className="p-1.5 text-[#8B6A3E] hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Piece"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((piece) => (
            <div
              key={piece.id}
              className="bg-[#FAF6ED] border border-[#D4C4A0] overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE3CC]">
                <OptimizedImage
                  src={piece.img}
                  thumbnail={piece.thumbnail}
                  alt={piece.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[8px] tracking-[0.2em] uppercase bg-[#2D2418]/90 text-[#FAF6ED] px-2 py-0.5">
                    {piece.tag}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleToggle(piece)}
                    className={`text-[8px] tracking-wider uppercase px-2 py-0.5 font-bold ${
                      piece.available
                        ? "bg-emerald-700 text-white"
                        : "bg-amber-800 text-white"
                    }`}
                  >
                    {piece.available ? "Available" : "Rented"}
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#2D2418]">
                    {piece.title}
                  </h4>
                  <p className="text-xs text-[#8B6A3E] mt-0.5">
                    {piece.designer}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EDE3CC]">
                    <div>
                      <p className="text-[10px] uppercase text-[#8B6A3E]">
                        Buy
                      </p>
                      <p className="font-serif text-sm font-semibold text-[#2D2418]">
                        {piece.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-[#8B6A3E]">
                        Rent
                      </p>
                      <p className="font-serif text-sm font-semibold text-[#8B6A3E]">
                        {piece.rent}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#EDE3CC]">
                  <button
                    onClick={() => handleOpenEditModal(piece)}
                    className="flex-1 py-1.5 border border-[#D4C4A0] text-[11px] font-semibold uppercase tracking-wider text-[#2D2418] hover:bg-[#2D2418] hover:text-[#FAF6ED] transition-all text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(piece.id)}
                    className="p-1.5 border border-[#D4C4A0] text-red-700 hover:bg-red-700 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Reset Action */}
      <div className="bg-[#EDE3CC]/40 border border-[#D4C4A0] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C3D1E]">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-[#8B6A3E]" />
          <span>
            Need to reset changes? You can restore the 9 signature bridal
            pieces.
          </span>
        </div>
        <button
          onClick={() => {
            if (
              confirm(
                "Reset catalog to default seed inventory? Custom items will be replaced.",
              )
            ) {
              resetToDefault()
              showNotification("Catalog reset to default 9 vault pieces.")
            }
          }}
          className="px-4 py-1.5 border border-[#D4C4A0] bg-[#FAF6ED] text-[#5C3D1E] hover:border-[#2D2418] hover:text-[#2D2418] transition-colors uppercase tracking-wider text-[11px] font-medium"
        >
          Restore Defaults
        </button>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-[#1A1008]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6ED] border border-red-300 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#2D2418]">
              Confirm Deletion
            </h3>
            <p className="text-xs text-[#5C3D1E] leading-relaxed">
              Are you sure you want to remove this piece from The Lehenga Vault?
              This action will remove it from the online catalog and booking
              system.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-[#D4C4A0] text-xs uppercase tracking-wider text-[#5C3D1E] hover:bg-[#EDE3CC]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
              >
                Delete Piece
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
