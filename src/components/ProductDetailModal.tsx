import { useState, useEffect, useCallback } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  Tag,
} from "lucide-react"
import { Product } from "../types"
import OptimizedImage from "./OptimizedImage"
import { getPricingDetails } from "../lib/pricing"
import { buildWhatsAppEnquiryUrl } from "../lib/whatsapp"

interface ProductDetailModalProps {
  isOpen: boolean
  piece: Product | null
  onClose: () => void
}

export default function ProductDetailModal({
  isOpen,
  piece,
  onClose,
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Reset active image index whenever the piece changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [piece?.id])

  const images: string[] =
    piece?.images && piece.images.length > 0
      ? piece.images
      : piece?.img
        ? [piece.img]
        : []

  const totalImages = images.length

  const handlePrev = useCallback(() => {
    if (totalImages <= 1) return
    setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1))
  }, [totalImages])

  const handleNext = useCallback(() => {
    if (totalImages <= 1) return
    setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1))
  }, [totalImages])

  // Keyboard navigation: Escape to close, Left/Right arrows to cycle images
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        handlePrev()
      } else if (e.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, handlePrev, handleNext])

  // Body scroll lock while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen || !piece) return null

  const pricing = getPricingDetails(piece)
  const currentImage = images[activeImageIndex] || piece.img

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1A1008]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-piece-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6ED] border border-[#C9A84C]/50 w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialogue"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#2D2418]/80 hover:bg-[#2D2418] text-[#FAF6ED] flex items-center justify-center transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Multi-Image Interactive Gallery */}
          <div className="bg-[#EDE3CC] p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D4C4A0]">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#E2D6BC] shadow-inner">
              <OptimizedImage
                key={currentImage}
                src={currentImage}
                thumbnail={piece.thumbnail}
                alt={`${piece.title} - View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Tag & Discount Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                <span className="text-[9px] tracking-[0.25em] uppercase bg-[#C9A84C] text-[#FAF6ED] px-2.5 py-1 font-semibold shadow-sm">
                  {piece.tag}
                </span>
                {pricing.hasDiscount && (
                  <span className="text-[8px] tracking-[0.18em] uppercase bg-[#2D2418]/90 backdrop-blur-sm text-[#FAF6ED] px-2 py-0.5 border border-[#C9A84C]/50 shadow-sm">
                    Limited Offer
                  </span>
                )}
              </div>

              {/* Availability Status Badge */}
              <div className="absolute top-3 right-3 pointer-events-none">
                <span
                  className={`text-[9px] tracking-wider uppercase font-semibold px-2.5 py-1 shadow-sm ${
                    piece.available
                      ? "bg-emerald-800/90 text-white"
                      : "bg-amber-900/90 text-white"
                  }`}
                >
                  {piece.available ? "Available" : "Currently Rented"}
                </span>
              </div>

              {/* Previous / Next Arrow Controls */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2D2418]/70 hover:bg-[#2D2418] text-[#FAF6ED] flex items-center justify-center transition-all shadow-md focus:outline-none"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2D2418]/70 hover:bg-[#2D2418] text-[#FAF6ED] flex items-center justify-center transition-all shadow-md focus:outline-none"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image Counter Pill */}
                  <div className="absolute bottom-3 right-3 bg-[#2D2418]/80 backdrop-blur-xs text-[#FAF6ED] text-[10px] tracking-widest px-2.5 py-1 font-mono">
                    {activeImageIndex + 1} / {totalImages}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {totalImages > 1 && (
              <div className="mt-4 pt-3 border-t border-[#D4C4A0]/60">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B6A3E] font-medium mb-2">
                  Multi-Angle Gallery ({totalImages} photos)
                </p>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-20 flex-shrink-0 overflow-hidden transition-all border-2 ${
                        activeImageIndex === idx
                          ? "border-[#C9A84C] scale-102 shadow-md ring-2 ring-[#C9A84C]/40"
                          : "border-transparent opacity-65 hover:opacity-100 hover:border-[#D4C4A0]"
                      }`}
                      aria-label={`Switch to angle ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${piece.title} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Piece Specifications & Conversion Funnel */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Eyebrow & Designer */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#8B6A3E] font-semibold">
                    {piece.designer}
                  </span>
                  {piece.sku && (
                    <>
                      <span className="text-[#D4C4A0]">•</span>
                      <span className="text-[10px] font-mono text-[#8B6A3E] uppercase tracking-wider">
                        {piece.sku}
                      </span>
                    </>
                  )}
                </div>
                <h2
                  id="dialog-piece-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2418] leading-tight"
                >
                  {piece.title}
                </h2>
              </div>

              {/* Dual Pricing Card */}
              <div className="bg-[#EDE3CC]/60 border border-[#D4C4A0] p-4 space-y-2">
                <div className="flex items-baseline justify-between gap-2 border-b border-[#D4C4A0]/60 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8B6A3E] font-medium block">
                      Purchase Price (Buy)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      {pricing.hasDiscount && (
                        <span className="text-xs text-neutral-400 line-through">
                          {pricing.buyPrice}
                        </span>
                      )}
                      <span className="font-serif text-xl font-semibold text-[#2D2418]">
                        {pricing.currentPrice}
                      </span>
                      {pricing.hasDiscount && pricing.discountPercent && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          {pricing.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#8B6A3E] font-medium block">
                      Rental Price
                    </span>
                    <p className="font-serif text-xl font-semibold text-[#8B6A3E] mt-0.5">
                      {piece.rent}
                    </p>
                    <span className="text-[10px] text-[#8B6A3E]">
                      per 3-5 days
                    </span>
                  </div>
                </div>

                {pricing.hasDiscount && pricing.discountSavings && (
                  <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>
                      Limited time savings: ₹
                      {pricing.discountSavings.toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
              </div>

              {/* Garment Attributes (Color, Fabric, Size) */}
              <div className="grid grid-cols-3 gap-2.5 py-2">
                <div className="bg-[#FAF6ED] p-2.5 border border-[#D4C4A0]">
                  <span className="text-[9px] uppercase tracking-wider text-[#8B6A3E] block">
                    Color
                  </span>
                  <span className="text-xs font-medium text-[#2D2418] truncate block mt-0.5">
                    {piece.color || "Crimson & Gold"}
                  </span>
                </div>

                <div className="bg-[#FAF6ED] p-2.5 border border-[#D4C4A0]">
                  <span className="text-[9px] uppercase tracking-wider text-[#8B6A3E] block">
                    Fabric
                  </span>
                  <span className="text-xs font-medium text-[#2D2418] truncate block mt-0.5">
                    {piece.fabric || "Silk & Organza"}
                  </span>
                </div>

                <div className="bg-[#FAF6ED] p-2.5 border border-[#D4C4A0]">
                  <span className="text-[9px] uppercase tracking-wider text-[#8B6A3E] block">
                    Fitting
                  </span>
                  <span className="text-xs font-medium text-[#2D2418] truncate block mt-0.5">
                    {piece.size || "Custom Alterable"}
                  </span>
                </div>
              </div>

              {/* Description & Curator Notes */}
              {piece.description && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#8B6A3E] font-medium mb-1.5">
                    Curator Notes
                  </h4>
                  <p className="text-xs text-[#5C3D1E] leading-relaxed">
                    {piece.description}
                  </p>
                </div>
              )}

              {/* Guarantee Strip */}
              <div className="flex items-center gap-4 text-[11px] text-[#8B6A3E] pt-2">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>100% Designer Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Complimentary Steam & Bag</span>
                </div>
              </div>
            </div>

            {/* Conversion CTA Block */}
            <div className="space-y-2.5 pt-4 border-t border-[#D4C4A0]">
              {/* Primary Direct WhatsApp Action */}
              <a
                href={buildWhatsAppEnquiryUrl(piece)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {piece.available
                    ? "Book / Enquire on WhatsApp"
                    : "Join Waitlist via WhatsApp"}
                </span>
              </a>

              {/* Dual Buy vs Rent Specific Enquiries */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={buildWhatsAppEnquiryUrl(piece, "buy")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 border border-[#D4C4A0] hover:border-[#2D2418] text-[#2D2418] hover:bg-[#2D2418] hover:text-[#FAF6ED] text-[11px] uppercase tracking-wider font-medium transition-all text-center"
                >
                  Enquire to Buy
                </a>
                <a
                  href={buildWhatsAppEnquiryUrl(piece, "rent")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 border border-[#D4C4A0] hover:border-[#8B6A3E] text-[#8B6A3E] hover:bg-[#EDE3CC] text-[11px] uppercase tracking-wider font-semibold transition-all text-center"
                >
                  Enquire to Rent
                </a>
              </div>

              {/* Atelier Trial Link */}
              <div className="text-center pt-1">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8B6A3E] hover:text-[#2D2418] transition-colors"
                >
                  <Calendar className="w-3 h-3 text-[#C9A84C]" />
                  <span>Or schedule a private atelier trial in Thane</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
