import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useProducts } from "../context/ProductContext"
import OptimizedImage from "../components/OptimizedImage"
import { buildWhatsAppEnquiryUrl } from "../lib/whatsapp"
import { getPricingDetails } from "../lib/pricing"
import { PRODUCT_CATEGORIES } from "../types"

const filters = ["All", ...PRODUCT_CATEGORIES]
const PAGE_SIZE_OPTIONS = [5, 10, 20] as const
type PageSize = typeof PAGE_SIZE_OPTIONS[number]

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total]
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, "...", current - 1, current, current + 1, "...", total]
}

export default function Collections() {
  const { products } = useProducts()
  const [active, setActive] = useState("All")
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [currentPage, setCurrentPage] = useState(1)
  const gridTopRef = useRef<HTMLDivElement>(null)

  const filtered =
    active === "All" ? products : products.filter((p) => p.tag === active)

  // Pagination calculation (default top 10 lehengas on page 1)
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedPieces = filtered.slice(startIndex, endIndex)

  const handleFilterChange = (f: string) => {
    setActive(f)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="bg-[#F5EDD8] min-h-screen">
      {/* Page Header */}
      <div className="bg-[#EDE3CC] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B6A3E] mb-3 font-medium">
            The Lehenga Vault
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#2D2418] font-semibold">
            Our Collections
          </h1>
          <p className="text-[#5C3D1E] mt-4 max-w-xl leading-relaxed">
            Hand-curated pieces from India's finest designers. Each lehenga in
            our vault is chosen for its craftsmanship, heritage, and timeless
            beauty.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Scroll anchor target */}
        <div ref={gridTopRef} className="scroll-mt-28" />

        {/* Filters and Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-5 py-2 text-xs tracking-widest uppercase font-medium transition-all border ${
                  active === f
                    ? "bg-[#2D2418] text-[#FAF6ED] border-[#2D2418]"
                    : "border-[#D4C4A0] text-[#5C3D1E] hover:border-[#C9A84C] hover:text-[#C9A84C] bg-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#8B6A3E] tracking-wider font-medium">
            {filtered.length} piece{filtered.length !== 1 ? "s" : ""} in{" "}
            {active}
          </span>
        </div>

        {/* Pagination Sub-bar: Status and Per-Page Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#D4C4A0]/60">
          <div className="text-xs text-[#8B6A3E]">
            {totalItems > 0 ? (
              <span>
                Showing{" "}
                <span className="font-semibold text-[#2D2418]">
                  {startIndex + 1}
                </span>
                –
                <span className="font-semibold text-[#2D2418]">{endIndex}</span>{" "}
                of{" "}
                <span className="font-semibold text-[#2D2418]">
                  {totalItems}
                </span>{" "}
                pieces
              </span>
            ) : (
              <span>No pieces found in this category</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-[11px] tracking-wider uppercase text-[#8B6A3E] font-medium">
              Pieces Per Page:
            </span>
            <div className="inline-flex border border-[#D4C4A0] rounded-sm overflow-hidden bg-[#FAF6ED] shadow-xs">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  className={`px-3.5 py-1 text-xs font-medium tracking-wider transition-colors ${
                    pageSize === size
                      ? "bg-[#2D2418] text-[#FAF6ED] font-semibold"
                      : "text-[#5C3D1E] hover:bg-[#EDE3CC]/60"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {paginatedPieces.length === 0 ? (
          <div className="text-center py-20 bg-[#EDE3CC]/30 border border-[#D4C4A0]/60 rounded-sm">
            <p className="font-serif text-2xl text-[#2D2418] mb-2">
              No lehengas found
            </p>
            <p className="text-xs text-[#8B6A3E] mb-6">
              There are currently no pieces tagged under "{active}".
            </p>
            <button
              onClick={() => handleFilterChange("All")}
              className="px-6 py-2.5 bg-[#2D2418] text-[#FAF6ED] text-xs uppercase tracking-widest font-medium hover:bg-[#C9A84C] transition-colors"
            >
              View All Collections
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {paginatedPieces.map((piece) => {
              const pricing = getPricingDetails(piece)

              return (
                <div key={piece.id} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE3CC]">
                    <OptimizedImage
                      src={piece.img}
                      thumbnail={piece.thumbnail}
                      alt={piece.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {!piece.available && (
                      <div className="absolute inset-0 bg-[#2D2418]/50 flex items-center justify-center">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-[#FAF6ED] bg-[#2D2418]/80 px-4 py-2">
                          Currently Rented
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      <span className="text-[8px] tracking-[0.25em] uppercase bg-[#C9A84C] text-[#FAF6ED] px-2 py-1">
                        {piece.tag}
                      </span>
                      {pricing.hasDiscount && (
                        <span className="text-[8px] tracking-[0.18em] uppercase bg-[#2D2418]/90 backdrop-blur-sm text-[#FAF6ED] px-2 py-0.5 border border-[#C9A84C]/50 shadow-sm">
                          Limited Offer
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-[#1A1008]/90 via-[#1A1008]/40 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <a
                        href={buildWhatsAppEnquiryUrl(piece)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2.5 bg-[#C9A84C] hover:bg-[#B8924A] text-[#FAF6ED] text-[11px] sm:text-xs tracking-widest uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>
                          {piece.available ? "Book / Enquire" : "Join Waitlist"}
                        </span>
                      </a>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-serif text-lg text-[#2D2418] font-semibold">
                      {piece.title}
                    </p>
                    <p className="text-xs text-[#8B6A3E] mt-0.5 tracking-wider">
                      {piece.designer}
                    </p>
                    <div className="flex items-start justify-between mt-3 gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs text-[#8B6A3E] uppercase tracking-wider">
                            Buy
                          </p>
                          {pricing.hasDiscount && (
                            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 text-[#7A5B2B] bg-[#C9A84C]/20 border border-[#C9A84C]/40 rounded">
                              Limited Time Discount
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                          {pricing.hasDiscount && (
                            <span className="text-xs text-neutral-400 line-through">
                              {pricing.buyPrice}
                            </span>
                          )}
                          <p className="font-serif text-base text-[#2D2418] font-semibold">
                            {pricing.currentPrice}
                          </p>
                          {pricing.hasDiscount &&
                            pricing.discountPercent &&
                            pricing.discountPercent > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-700">
                                ({pricing.discountPercent}% OFF)
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#8B6A3E] uppercase tracking-wider">
                          Rent
                        </p>
                        <p className="font-serif text-base text-[#8B6A3E] font-medium">
                          {piece.rent}
                        </p>
                      </div>
                    </div>

                    {/* Direct quick action WhatsApp options */}
                    <div className="mt-3 pt-2.5 border-t border-[#D4C4A0]/60 flex items-center justify-between text-[11px]">
                      <a
                        href={buildWhatsAppEnquiryUrl(piece, "buy")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8B6A3E] hover:text-[#C9A84C] transition-colors font-medium flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>Enquire to Buy</span>
                      </a>
                      <span className="text-[#D4C4A0]">·</span>
                      <a
                        href={buildWhatsAppEnquiryUrl(piece, "rent")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C9A84C] hover:text-[#B8924A] transition-colors font-semibold flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>Enquire to Rent</span>
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Navigation Bar */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 border-t border-[#D4C4A0]/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8B6A3E] order-2 sm:order-1 tracking-wider">
              Page{" "}
              <span className="font-semibold text-[#2D2418]">{safePage}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#2D2418]">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-[#D4C4A0] text-xs tracking-wider uppercase text-[#5C3D1E] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[#2D2418] hover:enabled:text-[#2D2418] transition-all bg-[#FAF6ED]"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(safePage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-[#8B6A3E]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-9 h-9 flex items-center justify-center text-xs tracking-wider transition-all border ${
                        safePage === p
                          ? "bg-[#2D2418] text-[#FAF6ED] border-[#2D2418] font-semibold shadow-xs"
                          : "border-[#D4C4A0] text-[#5C3D1E] hover:border-[#C9A84C] hover:text-[#C9A84C] bg-[#FAF6ED]"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-[#D4C4A0] text-xs tracking-wider uppercase text-[#5C3D1E] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[#2D2418] hover:enabled:text-[#2D2418] transition-all bg-[#FAF6ED]"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Private Viewing CTA */}
        <div className="mt-14 text-center border-t border-[#D4C4A0] pt-10">
          <p className="text-sm text-[#8B6A3E] mb-4">
            Looking for a specific bridal couture piece or bespoke styling?
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3.5 border border-[#2D2418] text-[#2D2418] text-xs tracking-widest uppercase font-medium hover:bg-[#2D2418] hover:text-[#FAF6ED] transition-all"
          >
            Request Private Viewing
          </Link>
        </div>
      </div>
    </div>
  )
}
