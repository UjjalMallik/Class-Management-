"use client"

import { Camera, Loader2, Trash2 } from "lucide-react"

interface ImageUploadFieldProps {
  images: string[]
  uploadStage: "idle" | "compressing" | "uploading"
  removingUrl?: string | null
  onFiles: (files: File[]) => void
  onRemove: (url: string) => void
}

export default function ImageUploadField({
  images,
  uploadStage,
  removingUrl,
  onFiles,
  onRemove,
}: ImageUploadFieldProps) {
  const isBusy = uploadStage !== "idle"
  const status = uploadStage === "compressing" ? "Compressing..." : "Uploading..."

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <img src={url} alt="Uploaded preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(url)}
                disabled={removingUrl === url || isBusy}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:opacity-100"
                aria-label="Remove image"
              >
                {removingUrl === url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-sm font-medium text-slate-600 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:bg-teal-500/10">
        {isBusy ? <Loader2 className="h-5 w-5 animate-spin text-teal-500" /> : <Camera className="h-5 w-5 text-teal-500" />}
        <span>{isBusy ? status : images.length ? "Add More Images" : "Select Images"}</span>
        <span className="text-xs font-normal text-slate-400">PNG, JPG, WEBP up to 500KB after compression</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={isBusy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length) onFiles(files)
            event.currentTarget.value = ""
          }}
        />
      </label>
    </div>
  )
}
