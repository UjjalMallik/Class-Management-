"use client"

import { useState } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  eager?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
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
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${containerClassName}`}
    >
      {!loaded && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority || eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  )
}
