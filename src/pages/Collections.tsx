import { useState } from "react"
import { Link } from "react-router-dom"
import { useProducts } from "../context/ProductContext"
import OptimizedImage from "../components/OptimizedImage"

const filters = ["All", "Bridal", "Indo-Western", "Festive", "Reception"]

export default function Collections() {
  const { products } = useProducts()
  const [active, setActive] = useState("All")

  const filtered =
    active === "All" ? products : products.filter((p) => p.tag === active)

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
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 text-xs tracking-widest uppercase font-medium transition-all border ${
                active === f
                  ? "bg-[#2D2418] text-[#FAF6ED] border-[#2D2418]"
                  : "border-[#D4C4A0] text-[#5C3D1E] hover:border-[#C9A84C] hover:text-[#C9A84C] bg-transparent"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#8B6A3E] self-center">
            {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {filtered.map((piece) => (
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
                <div className="absolute top-3 left-3">
                  <span className="text-[8px] tracking-[0.25em] uppercase bg-[#C9A84C] text-[#FAF6ED] px-2 py-1">
                    {piece.tag}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1008] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    to="/contact"
                    className="block w-full text-center py-2.5 bg-[#C9A84C] text-[#FAF6ED] text-xs tracking-widest uppercase font-medium hover:bg-[#B8924A] transition-colors"
                  >
                    {piece.available ? "Book / Enquire" : "Join Waitlist"}
                  </Link>
                </div>
              </div>
              <div className="pt-4">
                <p className="font-serif text-lg text-[#2D2418] font-semibold">
                  {piece.title}
                </p>
                <p className="text-xs text-[#8B6A3E] mt-0.5 tracking-wider">
                  {piece.designer}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-[#8B6A3E] uppercase tracking-wider">
                      Buy
                    </p>
                    <p className="font-serif text-base text-[#2D2418] font-medium">
                      {piece.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8B6A3E] uppercase tracking-wider">
                      Rent
                    </p>
                    <p className="font-serif text-base text-[#8B6A3E] font-medium">
                      {piece.rent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more placeholder */}
        <div className="mt-16 text-center border-t border-[#D4C4A0] pt-10">
          <p className="text-sm text-[#8B6A3E] mb-4">
            Showing {filtered.length} of 60+ pieces in our vault
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
