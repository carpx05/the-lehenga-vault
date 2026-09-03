import React, { useState, useRef } from "react"
import { Product } from "../../types"
import { optimizeImageForUpload, formatBytes } from "../../lib/imageOptimizer"
import {
  uploadImageToSupabase,
  getSavedSupabaseConfig,
} from "../../lib/supabase"
import {
  X,
  Upload,
  Sparkles,
  CheckCircle,
  CloudUpload,
  Image as ImageIcon,
  Zap,
} from "lucide-react"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: Omit<Product, "id"> | Product) => Promise<void>
  initialData?: Product | null
}

const DESIGNER_PRESETS = [
  "Sabyasachi",
  "Manish Malhotra",
  "Tarun Tahiliani",
  "Anita Dongre",
  "Rimple & Harpreet",
  "Falguni Shane Peacock",
  "Abhinav Mishra",
  "Anamika Khanna",
  "Raw Mango",
  "Other Label",
]

const TAG_PRESETS = ["Bridal", "Indo-Western", "Festive", "Reception"]

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProductModalProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [designer, setDesigner] = useState(
    initialData?.designer || "Tarun Tahiliani",
  )
  const [customDesigner, setCustomDesigner] = useState("")
  const [price, setPrice] = useState(initialData?.price || "₹65,000")
  const [rent, setRent] = useState(initialData?.rent || "₹8,500")
  const [tag, setTag] = useState(initialData?.tag || "Bridal")
  const [available, setAvailable] = useState(
    initialData?.available !== undefined ? initialData.available : true,
  )
  const [img, setImg] = useState(initialData?.img || "")
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [sku, setSku] = useState(
    initialData?.sku || `LV-${Math.floor(100 + Math.random() * 900)}`,
  )
  const [color, setColor] = useState(initialData?.color || "")
  const [fabric, setFabric] = useState(initialData?.fabric || "Silk & Organza")
  const [size, setSize] = useState(initialData?.size || "M (Customizable)")

  // Image optimization & upload state
  const [optimizing, setOptimizing] = useState(false)
  const [uploadingToCloud, setUploadingToCloud] = useState(false)
  const [optimizationStats, setOptimizationStats] = useState<{
    original: number
    optimized: number
    saved: number
  } | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabaseConfig = getSavedSupabaseConfig()

  if (!isOpen) return null

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOptimizing(true)
    setStatusMessage(
      "⚡ Optimizing image resolution & generating blur thumbnail for low latency...",
    )

    try {
      // 1. Run client-side optimization to compress & generate blur thumbnail
      const optimized = await optimizeImageForUpload(file, 1600, 2000, 0.82)
      setThumbnail(optimized.thumbnailDataUrl)
      setOptimizationStats({
        original: optimized.originalSize,
        optimized: optimized.optimizedSize,
        saved: optimized.savedPercent,
      })

      // 2. If Supabase is connected, offer/perform direct upload
      if (supabaseConfig.isConnected && supabaseConfig.url) {
        setUploadingToCloud(true)
        setStatusMessage(
          "☁️ Uploading optimized WebP to Supabase Storage with 1-year CDN cache headers...",
        )
        try {
          const { url } = await uploadImageToSupabase(
            optimized.file,
            file.name,
            supabaseConfig,
          )
          setImg(url)
          setStatusMessage(
            `✅ Uploaded to Supabase Storage CDN! Latency-optimized.`,
          )
        } catch (uploadErr) {
          console.warn(uploadErr)
          // Fallback to local preview data URL
          setImg(optimized.previewUrl)
          setStatusMessage(
            "⚠️ Storage upload failed. Using compressed local preview. Check Supabase credentials.",
          )
        } finally {
          setUploadingToCloud(false)
        }
      } else {
        // Use optimized preview URL or dataURL
        setImg(optimized.previewUrl)
        setStatusMessage(
          `✅ Optimized! Saved ${optimized.savedPercent}% bandwidth (${formatBytes(optimized.optimizedSize)}).`,
        )
      }
    } catch (err) {
      console.error(err)
      setStatusMessage("Failed to process image.")
    } finally {
      setOptimizing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !img.trim()) {
      alert("Please provide at least a Title and Image URL.")
      return
    }

    setIsSaving(true)
    try {
      const finalDesigner =
        designer === "Other Label" && customDesigner ? customDesigner : designer
      const productPayload = {
        ...(initialData ? { id: initialData.id } : {}),
        title: title.trim(),
        designer: finalDesigner,
        price: price.startsWith("₹") ? price : `₹${price}`,
        rent: rent.startsWith("₹") ? rent : `₹${rent}`,
        tag,
        available,
        img: img.trim(),
        thumbnail: thumbnail || undefined,
        description: description.trim(),
        sku: sku.trim(),
        color: color.trim(),
        fabric: fabric.trim(),
        size: size.trim(),
      }

      await onSave(productPayload as Product)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save product.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1008]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#FAF6ED] border border-[#C9A84C]/40 w-full max-w-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#2D2418] px-6 py-5 flex items-center justify-between border-b border-[#5C3D1E]">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A84C] font-semibold">
              {initialData ? "Edit Vault Piece" : "New Acquisition"}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl text-[#EDE3CC] font-semibold">
              {initialData ? initialData.title : "Add Lehenga to Inventory"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#C4B49A] hover:text-[#FAF6ED] p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Section 1: Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Piece Title / Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Crimson Heirloom"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Designer Label *
              </label>
              <select
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              >
                {DESIGNER_PRESETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {designer === "Other Label" && (
                <input
                  type="text"
                  placeholder="Enter designer name"
                  value={customDesigner}
                  onChange={(e) => setCustomDesigner(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Category / Tag *
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              >
                {TAG_PRESETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                SKU / Vault ID
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="LV-BR-012"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Purchase Price (₹) *
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹68,000"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Rental Price (₹ / 3-5 days) *
              </label>
              <input
                type="text"
                required
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="₹8,500"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Section 2: Image Pipeline & High-Res Storage Offloading */}
          <div className="border border-[#D4C4A0] bg-[#EDE3CC]/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-semibold">
                  High-Res Image Pipeline
                </span>
                <h4 className="font-serif text-base text-[#2D2418] font-semibold">
                  Product Visual & Supabase Storage
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF6ED] border border-[#D4C4A0] text-[10px] uppercase font-medium text-[#5C3D1E]">
                <Zap className="w-3 h-3 text-[#C9A84C]" />
                Client Compression & Blur-up
              </div>
            </div>

            {/* Dropzone & Picker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={optimizing || uploadingToCloud}
                  className="w-full py-6 border-2 border-dashed border-[#C9A84C]/60 hover:border-[#C9A84C] bg-[#FAF6ED] flex flex-col items-center justify-center gap-2 text-center p-4 transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E] group-hover:text-[#C9A84C] transition-colors">
                    {uploadingToCloud ? (
                      <CloudUpload className="w-5 h-5 animate-bounce text-[#C9A84C]" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2D2418]">
                      {optimizing
                        ? "Compressing WebP..."
                        : uploadingToCloud
                          ? "Offloading to Supabase..."
                          : "Upload High-Res Photo"}
                    </span>
                    <p className="text-[11px] text-[#8B6A3E] mt-0.5">
                      Auto-compressed &amp; thumbnailed for ultra-fast load
                      times (under 50ms)
                    </p>
                  </div>
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-28 h-36 bg-[#EDE3CC] border border-[#D4C4A0] overflow-hidden flex items-center justify-center">
                  {img ? (
                    <img
                      src={img}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-[#8B6A3E]">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">No image yet</span>
                    </div>
                  )}
                </div>
                {img && (
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Image Ready
                  </span>
                )}
              </div>
            </div>

            {/* Optimization stats badge */}
            {optimizationStats && (
              <div className="bg-[#FAF6ED] border border-[#C9A84C]/40 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                  <span>
                    Original:{" "}
                    <strong>{formatBytes(optimizationStats.original)}</strong> →
                    Optimized:{" "}
                    <strong>{formatBytes(optimizationStats.optimized)}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  {optimizationStats.saved}% bandwidth saved
                </span>
              </div>
            )}

            {/* Status notification */}
            {statusMessage && (
              <p className="text-xs text-[#5C3D1E] bg-[#FAF6ED] p-2 border border-[#D4C4A0]">
                {statusMessage}
              </p>
            )}

            {/* Manual Image URL Input fallback */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8B6A3E] mb-1">
                Or Direct Image URL (CDN / Unsplash / Supabase Public URL)
              </label>
              <input
                type="url"
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-xs text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Section 3: Extra Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Color Palette
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Deep Crimson & Gold"
                className="w-full px-3 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Fabric & Work
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Raw Silk / Zardozi"
                className="w-full px-3 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Available Sizes
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="S / M / L (Alterable)"
                className="w-full px-3 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-sm text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#EDE3CC]/60 border border-[#D4C4A0]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#2D2418] font-semibold">
                Vault Availability Status
              </p>
              <p className="text-xs text-[#5C3D1E]">
                {available
                  ? "Available for immediate trial & booking"
                  : "Marked as Currently Rented / Reserved"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
                available
                  ? "bg-emerald-700 text-white border-emerald-800"
                  : "bg-amber-800 text-white border-amber-900"
              }`}
            >
              {available ? "Available" : "Currently Rented"}
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
              Curator Notes / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exquisite craftsmanship notes, embroidery techniques, styling suggestions..."
              className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4C4A0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-[#D4C4A0] text-[#5C3D1E] text-xs font-medium uppercase tracking-widest hover:border-[#2D2418] hover:text-[#2D2418] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || optimizing}
              className="px-8 py-3 bg-[#2D2418] hover:bg-[#5C3D1E] text-[#FAF6ED] text-xs font-semibold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving
                ? "Saving to Vault..."
                : initialData
                  ? "Update Piece"
                  : "Add to Vault"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
