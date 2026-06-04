"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ImageLightbox from "@/components/ImageLightbox"
import { Loader2 } from "lucide-react"

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

  useEffect(() => {
    fetchRoutine()
  }, [])

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
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const row = data.find((r) => r.day === day)
        return (
          <Card key={day}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#1e3a8a]">{day}</CardTitle>
                <span className="rounded bg-[#facc15] px-2 py-0.5 text-xs font-bold text-[#1e3a8a]">
                  WEEKDAY
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {row?.image_url ? (
                <button
                  onClick={() => setLightboxSrc(row.image_url)}
                  className="w-full rounded-lg overflow-hidden border border-[#1e3a8a]/10 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.image_url}
                    alt={`${day} routine`}
                    className="w-full h-auto object-contain"
                  />
                </button>
              ) : (
                <div className="flex items-center justify-center h-40 rounded-lg bg-[#e2e8f0] text-slate-500 text-sm">
                  No routine uploaded
                </div>
              )}

              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Paste new image URL..."
                    value={urlInputs[day] || ""}
                    onChange={(e) =>
                      setUrlInputs((prev) => ({ ...prev, [day]: e.target.value }))
                    }
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateImage(day)}
                    disabled={!urlInputs[day]}
                  >
                    Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
    </div>
  )
}
