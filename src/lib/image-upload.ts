import imageCompression from "browser-image-compression"
import { getSupabase } from "@/lib/supabase"

const BUCKET = "app-images"

export async function uploadImages(
  files: File[],
  onProgress?: (stage: "compressing" | "uploading") => void,
): Promise<string[]> {
  const urls: string[] = []
  try {
    for (const file of files) {
      onProgress?.("compressing")
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 1200,
        maxSizeMB: 500 / 1024,
        useWebWorker: true,
        fileType: "image/jpeg",
      })
      onProgress?.("uploading")
      urls.push(await uploadImage(compressedFile))
    }
  } catch (error) {
    await Promise.allSettled(urls.map((url) => deleteImage(url)))
    throw error
  }
  return urls
}

export async function uploadImage(file: File): Promise<string> {
  const randomId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const uniqueName = `${Date.now()}-${randomId}.jpg`
  const { error } = await getSupabase()
    .storage
    .from(BUCKET)
    .upload(uniqueName, file, { cacheControl: "3600", upsert: false })

  if (error) throw error

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(uniqueName)
  return data.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return
  const path = decodeURIComponent(url.slice(markerIndex + marker.length))
  const { error } = await getSupabase().storage.from(BUCKET).remove([path])
  if (error) throw error
}
