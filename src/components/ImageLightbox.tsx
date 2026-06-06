"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:p-4 bg-black/95 border-0">
        <DialogTitle className="sr-only">Routine Image - {alt}</DialogTitle>
        <DialogClose className="absolute top-2 right-2 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40" />
        <div className="relative flex items-center justify-center w-full h-full min-h-[50vh]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="95vw"
            quality={90}
            loading="eager"
            decoding="async"
            className="object-contain rounded transition-opacity duration-300"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
