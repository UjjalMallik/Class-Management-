"use client"

import { useEffect, useRef, useState } from "react"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  eager?: boolean
}

export default function LazyImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  eager = false,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [src])

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  )
}
