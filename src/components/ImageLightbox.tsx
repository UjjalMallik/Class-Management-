"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { X } from "lucide-react"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <>
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute -top-12 right-0 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative w-[95vw] md:max-w-4xl flex justify-center">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 95vw, 896px"
            quality={90}
            loading="eager"
            decoding="async"
            className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </>,
    document.body
  )
}
