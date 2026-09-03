import React, { useState } from "react"

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  thumbnail?: string
  alt: string
  className?: string
  aspectRatio?: string
}

export default function OptimizedImage({
  src,
  thumbnail,
  alt,
  className = "",
  aspectRatio = "aspect-[3/4]",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Fallback placeholder image
  const fallbackSrc =
    "https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?w=500&h=700&fit=crop&auto=format"

  return (
    <div
      className={`relative overflow-hidden bg-[#EDE3CC] ${aspectRatio} ${className}`}
    >
      {/* 1. Low-latency blur-up placeholder if thumbnail is present */}
      {thumbnail && !isLoaded && (
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105 opacity-70 transition-opacity duration-300"
        />
      )}

      {/* 2. Skeleton shimmer placeholder if no thumbnail and still loading */}
      {!thumbnail && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#EDE3CC] via-[#F5EDD8] to-[#EDE3CC] animate-pulse" />
      )}

      {/* 3. Full-resolution optimized image */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true)
          setIsLoaded(true)
        }}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        {...props}
      />
    </div>
  )
}
