"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
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
            <Card className={`rounded-2xl shadow-md dark:shadow-none border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md hover:dark:border-teal-500/30 hover:dark:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-lg group ${
              row?.image_url ? "cursor-pointer" : ""
            }`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-3 rounded-2xl">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-[#e5e7eb] text-xl tracking-tight">
                    {day}
                  </h3>
                </div>
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                  Weekday
                </span>
              </div>

              {row?.image_url ? (
                <LazyImage
                  src={row.image_url}
                  alt={`${day} routine`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="w-full h-auto rounded-lg object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-40 rounded-2xl bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#374151] text-slate-400 dark:text-[#9ca3af] text-sm">
                  No routine uploaded
                </div>
              )}

              {isAdmin && (
                <div
                  className="flex gap-2 pt-2"
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
            </CardContent>
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
        <div
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto z-50 bg-white/90 dark:bg-[#14151e]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 animate-fade-in-up"
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1c1d29] hover:bg-slate-200 dark:hover:bg-[#374151] text-slate-600 dark:text-[#e5e7eb] transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-3 pr-10">
              <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-2.5 rounded-2xl">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-800 dark:text-[#e5e7eb] text-xl tracking-tight leading-snug">
                {selectedCard.day}
              </h2>
            </div>
            <LazyImage
              src={selectedCard.image_url}
              alt={`${selectedCard.day} routine`}
              eager
              width={1200}
              height={800}
              sizes="(max-width: 768px) 90vw, 512px"
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
