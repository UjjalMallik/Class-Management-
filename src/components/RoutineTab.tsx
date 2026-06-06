"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import LazyImage from "@/components/ui/LazyImage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ImageLightbox from "@/components/ImageLightbox"
import { Loader2, CalendarCheck, X } from "lucide-react"

const DAYS = ["Thursday", "Friday", "Saturday"]

interface RoutineRow {
  id: number
  day: string
  image_url: string
}

export default function RoutineTab({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<RoutineRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})
  const [selectedCard, setSelectedCard] = useState<{ day: string; image_url: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchRoutine()
  }, [])

  useEffect(() => {
    if (selectedCard) {
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
    }
  }, [selectedCard])

  async function fetchRoutine() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("routine")
      .select("*")
      .in("day", DAYS)
      .order("id")
    if (data) setData(data as RoutineRow[])
    setLoading(false)
  }

  async function updateImage(day: string) {
    const newUrl = urlInputs[day]
    if (!newUrl) return
    await getSupabase().from("routine").update({ image_url: newUrl }).eq("day", day)
    await fetchRoutine()
    setUrlInputs((prev) => ({ ...prev, [day]: "" }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-[#14b8a6]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {DAYS.map((day, i) => {
        const row = data.find((r) => r.day === day)
        return (
          <div
            key={day}
            onClick={() => row?.image_url && setSelectedCard({ day, image_url: row.image_url })}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-in-up"
          >
            <Card className={`rounded-2xl border border-slate-200 dark:border-slate-700 border-t-4 border-t-teal-500 shadow-lg dark:shadow-2xl dark:shadow-black/40 transition-all duration-300 bg-white dark:bg-slate-800 overflow-hidden group ${
              row?.image_url ? "cursor-pointer" : ""
            }`}>
              <div className="p-6 pb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-2.5 rounded-xl">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-[#e5e7eb] truncate">
                    {day}
                  </h3>
                </div>
                <span className="shrink-0 bg-amber-100/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                  Weekday
                </span>
              </div>

              {row?.image_url ? (
                <div className="px-3 pb-3">
                  <div className="relative overflow-hidden rounded-xl">
                    <LazyImage
                      src={row.image_url}
                      alt={`${day} routine`}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="w-full h-auto object-cover"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)]"
                    />
                  </div>
                </div>
              ) : (
                <div className="mx-6 mb-6 flex items-center justify-center h-40 rounded-xl bg-slate-50 dark:bg-[#0a0b10] text-slate-400 dark:text-[#9ca3af] text-sm">
                  No routine uploaded
                </div>
              )}

              {isAdmin && (
                <div
                  className="p-6 pt-4 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    placeholder="Paste new image URL..."
                    value={urlInputs[day] || ""}
                    onChange={(e) =>
                      setUrlInputs((prev) => ({ ...prev, [day]: e.target.value }))
                    }
                    className="flex-1 rounded-full px-4 h-11 bg-slate-50/60 dark:bg-[#14151e] border-slate-200/70 dark:border-[#374151] text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateImage(day)}
                    disabled={!urlInputs[day]}
                    className="rounded-full px-5 h-11"
                  >
                    Update
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )
      })}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="Routine full view"
          open={!!lightboxSrc}
          onOpenChange={(o) => {
            if (!o) setLightboxSrc(null)
          }}
        />
      )}

      {selectedCard && mounted && createPortal(
        <>
          <div
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute -top-12 right-0 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-[95vw] md:max-w-4xl flex justify-center">
              <LazyImage
                src={selectedCard.image_url}
                alt={`${selectedCard.day} routine`}
                eager
                width={1200}
                height={800}
                sizes="(max-width: 768px) 95vw, 896px"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
