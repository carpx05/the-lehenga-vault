import React, { useState, useRef } from "react"
import { Product, PRODUCT_CATEGORIES } from "../../types"
import { optimizeImageForUpload, formatBytes } from "../../lib/imageOptimizer"
import {
  uploadImageToSupabase,
  getSavedSupabaseConfig,
} from "../../lib/supabase"
import { getPricingDetails, formatCurrency } from "../../lib/pricing"
import {
  X,
  Upload,
  Sparkles,
  CheckCircle,
  CloudUpload,
  Image as ImageIcon,
  Zap,
  Star,
  Trash2,
  Layers,
  Plus,
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

const TAG_PRESETS = PRODUCT_CATEGORIES

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
  const [buyPrice, setBuyPrice] = useState(
    initialData?.buy_price || initialData?.price || "₹65,000",
  )
  const [currentPrice, setCurrentPrice] = useState(
    initialData?.current_price || initialData?.price || "₹65,000",
  )
  const [rent, setRent] = useState(initialData?.rent || "₹8,500")
  const [tag, setTag] = useState(initialData?.tag || "Bridal")

  const livePricing = React.useMemo(() => {
    return getPricingDetails({
      buy_price: buyPrice,
      current_price: currentPrice,
    })
  }, [buyPrice, currentPrice])
  const [available, setAvailable] = useState(
    initialData?.available !== undefined ? initialData.available : true,
  )
  const [img, setImg] = useState(initialData?.img || "")
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images
    }
    if (initialData?.img) {
      return [initialData.img]
    }
    return []
  })
  const [additionalImageUrl, setAdditionalImageUrl] = useState("")
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

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "")
      setDesigner(initialData?.designer || "Tarun Tahiliani")
      setCustomDesigner("")
      setBuyPrice(initialData?.buy_price || initialData?.price || "₹65,000")
      setCurrentPrice(
        initialData?.current_price || initialData?.price || "₹65,000",
      )
      setRent(initialData?.rent || "₹8,500")
      setTag(initialData?.tag || "Bridal")
      setAvailable(
        initialData?.available !== undefined ? initialData.available : true,
      )
      setImg(initialData?.img || "")

      // Populate all existing images available for this piece from the catalog
      const existingImages: string[] = []
      if (initialData?.images && initialData.images.length > 0) {
        existingImages.push(...initialData.images)
      } else if (initialData?.img) {
        existingImages.push(initialData.img)
      }
      setGalleryImages(Array.from(new Set(existingImages)))

      setThumbnail(initialData?.thumbnail || "")
      setDescription(initialData?.description || "")
      setSku(initialData?.sku || `LV-${Math.floor(100 + Math.random() * 900)}`)
      setColor(initialData?.color || "")
      setFabric(initialData?.fabric || "Silk & Organza")
      setSize(initialData?.size || "M (Customizable)")
      setAdditionalImageUrl("")
      setStatusMessage(null)
      setOptimizationStats(null)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleImageFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setOptimizing(true)
    setStatusMessage(
      `⚡ Processing & compressing ${files.length} photo${
        files.length > 1 ? "s" : ""
      }...`,
    )

    let totalOriginal = 0
    let totalOptimized = 0
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setStatusMessage(
          `⚡ [${i + 1}/${files.length}] Compressing "${file.name}" to WebP...`,
        )

        // 1. Client-side compression & blur thumbnail
        const optimized = await optimizeImageForUpload(file, 1600, 2000, 0.82)
        totalOriginal += optimized.originalSize
        totalOptimized += optimized.optimizedSize

        if (!thumbnail && optimized.thumbnailDataUrl) {
          setThumbnail(optimized.thumbnailDataUrl)
        }

        // 2. Upload to Supabase Storage CDN if credentials available
        const currentSupabaseConfig = getSavedSupabaseConfig()
        const hasCloudStorage = Boolean(
          currentSupabaseConfig.url && currentSupabaseConfig.anonKey,
        )

        if (hasCloudStorage) {
          setUploadingToCloud(true)
          setStatusMessage(
            `☁️ [${i + 1}/${files.length}] Uploading "${file.name}" to Supabase Storage CDN...`,
          )
          try {
            const { url } = await uploadImageToSupabase(
              optimized.file,
              file.name,
              currentSupabaseConfig,
            )
            newUrls.push(url)
          } catch (uploadErr) {
            console.warn("Storage upload failed:", uploadErr)
            const errDetail =
              uploadErr instanceof Error
                ? uploadErr.message
                : "Storage upload failed"
            setStatusMessage(`⚠️ [${file.name}] ${errDetail}. Using local preview.`)
            newUrls.push(optimized.previewUrl)
          }
        } else {
          newUrls.push(optimized.previewUrl)
        }
      }

      const savedPercent =
        totalOriginal > 0
          ? Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100)
          : 0

      setOptimizationStats({
        original: totalOriginal,
        optimized: totalOptimized,
        saved: savedPercent,
      })

      // Add to gallery
      setGalleryImages((prev) => {
        const combined = [...prev, ...newUrls]
        return Array.from(new Set(combined))
      })

      // If no cover image yet, designate first uploaded image as cover
      if (!img && newUrls.length > 0) {
        setImg(newUrls[0])
      }

      setStatusMessage(
        `✅ Successfully added ${files.length} photo${
          files.length > 1 ? "s" : ""
        }! Saved ${savedPercent}% bandwidth.`,
      )
    } catch (err) {
      console.error(err)
      setStatusMessage("⚠️ Failed to process one or more images.")
    } finally {
      setOptimizing(false)
      setUploadingToCloud(false)
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleSelectCover = (url: string) => {
    setImg(url)
    setStatusMessage("★ Selected as Primary Cover Image.")
  }

  const handleRemoveImage = (urlToRemove: string) => {
    const updated = galleryImages.filter((u) => u !== urlToRemove)
    setGalleryImages(updated)
    if (img === urlToRemove) {
      setImg(updated.length > 0 ? updated[0] : "")
    }
    setStatusMessage("Image removed from gallery.")
  }

  const handleAddDirectUrl = () => {
    const trimmed = additionalImageUrl.trim()
    if (!trimmed) return
    if (galleryImages.includes(trimmed)) {
      setStatusMessage("Photo URL is already in the gallery.")
      return
    }
    const updated = [...galleryImages, trimmed]
    setGalleryImages(updated)
    if (!img) {
      setImg(trimmed)
    }
    setAdditionalImageUrl("")
    setStatusMessage("✅ Photo URL added to gallery.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const primaryCover = img.trim() || galleryImages[0] || ""
    if (!title.trim() || !primaryCover) {
      alert("Please provide at least a Title and at least one Photo.")
      return
    }

    setIsSaving(true)
    try {
      const finalDesigner =
        designer === "Other Label" && customDesigner ? customDesigner : designer
      const formattedBuy = formatCurrency(buyPrice)
      const formattedCurrent = formatCurrency(currentPrice)

      // Clean and sanitize gallery URLs
      const cleanGallery = galleryImages
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean)

      // Ensure primary cover image is positioned first in images array
      const remainingImages = cleanGallery.filter(
        (url) => url !== primaryCover,
      )
      const finalImagesList = primaryCover
        ? [primaryCover, ...remainingImages]
        : cleanGallery

      const productPayload = {
        ...(initialData ? { id: initialData.id } : {}),
        title: title.trim(),
        designer: finalDesigner,
        price: formattedCurrent,
        buy_price: formattedBuy,
        current_price: formattedCurrent,
        rent: formatCurrency(rent),
        tag,
        available,
        img: primaryCover,
        images: finalImagesList,
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
                Original Buy Price (₹) *
              </label>
              <input
                type="text"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="₹85,000"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
              <p className="text-[10px] text-[#8B6A3E] mt-1">
                Standard retail price (`buy_price`)
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#5C3D1E] font-medium mb-1.5">
                Current Selling Price (₹) *
              </label>
              <input
                type="text"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="₹68,000"
                className="w-full px-3.5 py-2.5 bg-[#FAF6ED] border border-[#D4C4A0] text-[#2D2418] text-sm focus:outline-none focus:border-[#C9A84C]"
              />
              <p className="text-[10px] text-[#8B6A3E] mt-1">
                Effective price (`current_price`)
              </p>
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
              <p className="text-[10px] text-[#8B6A3E] mt-1">
                Rental fee for booking
              </p>
            </div>

            {/* Live Discount Indicator */}
            {livePricing.hasDiscount && (
              <div className="sm:col-span-3 bg-[#FAF6ED] border border-[#C9A84C]/50 p-3 rounded flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-[#C9A84C]/20 text-[#6E4F28] border border-[#C9A84C]/40 rounded">
                    Limited Time Discount Active
                  </span>
                  <span className="text-neutral-400 line-through">
                    {livePricing.buyPrice}
                  </span>
                  <span className="font-serif font-bold text-[#2D2418] text-sm">
                    {livePricing.currentPrice}
                  </span>
                </div>
                {livePricing.discountPercent ? (
                  <span className="text-emerald-700 font-semibold text-xs">
                    {livePricing.discountPercent}% OFF (Save ₹
                    {livePricing.discountSavings?.toLocaleString("en-IN")})
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Section 2: Image Pipeline & Multi-Photo Gallery */}
          <div className="border border-[#D4C4A0] bg-[#EDE3CC]/40 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8B6A3E] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#C9A84C]" />
                  Multi-Angle Photography &amp; Cover Selection
                </span>
                <h4 className="font-serif text-base text-[#2D2418] font-semibold">
                  Product Visuals &amp; Supabase Storage
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF6ED] border border-[#D4C4A0] text-[10px] uppercase font-medium text-[#5C3D1E]">
                <Zap className="w-3 h-3 text-[#C9A84C]" />
                Client Compression &amp; Blur-up
              </div>
            </div>

            {/* Batch Multi-Photo Dropzone & Upload Button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageFilesChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={optimizing || uploadingToCloud}
                className="w-full py-6 border-2 border-dashed border-[#C9A84C]/70 hover:border-[#C9A84C] bg-[#FAF6ED] flex flex-col items-center justify-center gap-2 text-center p-4 transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#EDE3CC] flex items-center justify-center text-[#8B6A3E] group-hover:text-[#C9A84C] transition-colors shadow-xs">
                  {uploadingToCloud ? (
                    <CloudUpload className="w-6 h-6 animate-bounce text-[#C9A84C]" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2D2418] flex items-center justify-center gap-1.5">
                    {optimizing
                      ? "Compressing Photos..."
                      : uploadingToCloud
                        ? "Uploading to Supabase Storage..."
                        : "Upload Photos (Select Multiple at Once)"}
                  </span>
                  <p className="text-[11px] text-[#8B6A3E] mt-0.5">
                    Hold{" "}
                    <kbd className="px-1 py-0.5 bg-[#EDE3CC] text-[10px] font-mono border border-[#D4C4A0] rounded">
                      Ctrl
                    </kbd>{" "}
                    /{" "}
                    <kbd className="px-1 py-0.5 bg-[#EDE3CC] text-[10px] font-mono border border-[#D4C4A0] rounded">
                      Cmd
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-1 py-0.5 bg-[#EDE3CC] text-[10px] font-mono border border-[#D4C4A0] rounded">
                      Shift
                    </kbd>{" "}
                    to select multiple photos at once. Click any photo below to
                    select the Cover Image.
                  </p>
                </div>
              </button>
            </div>

            {/* Gallery Grid & Cover Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wider text-[#5C3D1E] font-medium flex items-center gap-1.5">
                  <span>Product Photos ({galleryImages.length})</span>
                  {img && (
                    <span className="text-[10px] text-[#8B6A3E] lowercase font-normal">
                      — click any photo to set as cover
                    </span>
                  )}
                </p>
                {img && (
                  <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Primary
                    Cover Assigned
                  </span>
                )}
              </div>

              {galleryImages.length === 0 ? (
                <div className="p-6 bg-[#FAF6ED] border border-[#D4C4A0] text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#8B6A3E] opacity-40" />
                  <p className="text-xs text-[#8B6A3E]">No photos added yet.</p>
                  <p className="text-[10px] text-[#8B6A3E]/80 mt-0.5">
                    Upload multiple angles above or paste direct image URLs
                    below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {galleryImages.map((photoUrl, idx) => {
                    const isCover = photoUrl === img || (!img && idx === 0)
                    return (
                      <div
                        key={`${photoUrl}-${idx}`}
                        onClick={() => handleSelectCover(photoUrl)}
                        className={`relative aspect-[3/4] bg-[#FAF6ED] overflow-hidden cursor-pointer group transition-all ${
                          isCover
                            ? "border-2 border-[#C9A84C] ring-2 ring-[#C9A84C]/50 shadow-md"
                            : "border border-[#D4C4A0] hover:border-[#C9A84C] opacity-80 hover:opacity-100"
                        }`}
                        title={
                          isCover
                            ? "Primary Cover Photo"
                            : "Click to set as Cover Photo"
                        }
                      >
                        <img
                          src={photoUrl}
                          alt={`Angle ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Top-left: Cover Badge or Selection Prompt */}
                        {isCover ? (
                          <div className="absolute top-1.5 left-1.5 bg-[#C9A84C] text-[#FAF6ED] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow flex items-center gap-1 z-10">
                            <Star className="w-2.5 h-2.5 fill-current" /> Cover
                          </div>
                        ) : (
                          <div className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectCover(photoUrl)
                              }}
                              className="w-full bg-[#2D2418]/90 hover:bg-[#C9A84C] text-[#FAF6ED] text-[9px] uppercase tracking-wider py-1 font-semibold transition-colors shadow"
                            >
                              Set as Cover
                            </button>
                          </div>
                        )}

                        {/* Delete / Remove Image Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(photoUrl)
                          }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow z-20"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Direct Image URL Input with Add Button */}
            <div className="pt-2">
              <label className="block text-[11px] uppercase tracking-wider text-[#8B6A3E] mb-1">
                Or Add Image by Direct URL (CDN / Unsplash / Supabase Public
                URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={additionalImageUrl}
                  onChange={(e) => setAdditionalImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddDirectUrl()
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 bg-[#FAF6ED] border border-[#D4C4A0] text-xs text-[#2D2418] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  disabled={!additionalImageUrl.trim()}
                  className="px-4 py-2 bg-[#FAF6ED] hover:bg-[#EDE3CC] border border-[#D4C4A0] text-xs uppercase tracking-wider font-semibold text-[#5C3D1E] flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A84C]" /> Add Photo
                </button>
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
