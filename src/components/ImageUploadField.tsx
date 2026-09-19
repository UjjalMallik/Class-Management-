"use client"

import { useEffect, useState } from "react"
import { Camera, ChevronLeft, ChevronRight, Loader2, Trash2, Upload, X } from "lucide-react"

interface ImageUploadFieldProps {
  images: string[]
  uploadStage: "idle" | "compressing" | "uploading"
  removingUrl?: string | null
  onFiles: (files: File[]) => void | Promise<void>
  onRemove: (url: string) => void
  onReorder?: (images: string[]) => void
}

export default function ImageUploadField({
  images,
  uploadStage,
  removingUrl,
  onFiles,
  onRemove,
  onReorder,
}: ImageUploadFieldProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [orderedImages, setOrderedImages] = useState(images)
  const isBusy = uploadStage !== "idle"
  const status = uploadStage === "compressing" ? "Compressing..." : "Uploading..."

  useEffect(() => {
    setOrderedImages(images)
  }, [images])

  useEffect(() => {
    const urls = pendingFiles.map((file) => URL.createObjectURL(file))
    setPendingPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [pendingFiles])

  function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return items
    const next = [...items]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    return next
  }

  function reorderUploaded(index: number, direction: -1 | 1) {
    const next = moveItem(orderedImages, index, direction)
    setOrderedImages(next)
    onReorder?.(next)
  }

  function removePending(index: number) {
    setPendingFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  async function uploadPendingFiles() {
    if (!pendingFiles.length || isBusy) return
    const files = [...pendingFiles]
    await onFiles(files)
    setPendingFiles([])
  }

  return (
    <div className="space-y-3">
      {(orderedImages.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {orderedImages.map((url, index) => (
            <div key={`uploaded-${url}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <img src={url} alt="Uploaded preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(url)}
                disabled={removingUrl === url || isBusy}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600/90 text-white shadow-sm backdrop-blur-sm transition hover:bg-red-700 disabled:opacity-60"
                aria-label="Remove image"
              >
                {removingUrl === url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => reorderUploaded(index, -1)}
                  disabled={index === 0 || isBusy}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move image left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => reorderUploaded(index, 1)}
                  disabled={index === orderedImages.length - 1 || isBusy}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move image right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-teal-400/60 dark:border-teal-500/60">
              {pendingPreviews[index] && <img src={pendingPreviews[index]} alt={`Selected image ${index + 1}`} className="h-full w-full object-cover" />}
              <span className="absolute left-2 top-2 rounded-full bg-teal-600/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Pending</span>
              <button
                type="button"
                onClick={() => removePending(index)}
                disabled={isBusy}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600/90 text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                aria-label="Remove selected image"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFiles((current) => moveItem(current, index, -1))}
                  disabled={index === 0 || isBusy}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move selected image left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingFiles((current) => moveItem(current, index, 1))}
                  disabled={index === pendingFiles.length - 1 || isBusy}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move selected image right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {pendingFiles.length > 0 && (
        <button
          type="button"
          onClick={() => void uploadPendingFiles()}
          disabled={isBusy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          Upload {pendingFiles.length} image{pendingFiles.length === 1 ? "" : "s"}
        </button>
      )}
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-sm font-medium text-slate-600 transition-colors hover:border-teal-400 hover:bg-teal-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:bg-teal-500/10">
        {isBusy ? <Loader2 className="h-5 w-5 animate-spin text-teal-500" /> : <Camera className="h-5 w-5 text-teal-500" />}
        <span>{isBusy ? status : orderedImages.length || pendingFiles.length ? "Add More Images" : "Select Images"}</span>
        <span className="text-xs font-normal text-slate-400">PNG, JPG, WEBP up to 500KB after compression</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={isBusy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length) setPendingFiles((current) => [...current, ...files])
            event.currentTarget.value = ""
          }}
        />
      </label>
    </div>
  )
}
