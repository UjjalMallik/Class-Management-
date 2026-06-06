"use client"

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
        <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="async"
            className="max-w-full max-h-[85vh] object-contain rounded transition-opacity duration-300"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
