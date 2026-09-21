"use client"

import { useState } from "react"
import Image from "next/image"

const loadedImageCache = new Set<string>()

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  eager?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  width?: number
  height?: number
}

export default function LazyImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  eager = false,
  priority = false,
  sizes = "100vw",
  quality = 75,
  width,
  height,
}: LazyImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const useIntrinsic = typeof width === "number" && typeof height === "number"
  const loaded = loadedSrc === src || loadedImageCache.has(src)

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${containerClassName}`}
    >
      {!loaded && (
        <div
          aria-label="Loading image"
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse"
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={useIntrinsic ? width : undefined}
        height={useIntrinsic ? height : undefined}
        fill={!useIntrinsic}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority || eager ? "eager" : "lazy"}
        unoptimized
        decoding="async"
        onLoad={() => {
          loadedImageCache.add(src)
          setLoadedSrc(src)
        }}
        onError={() => setLoadedSrc(src)}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  )
}
