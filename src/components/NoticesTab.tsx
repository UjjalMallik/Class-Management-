"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Loader2,
  Megaphone,
  Bell,
  CalendarDays,
  PartyPopper,
  Wrench,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock,
  Pin,
  Inbox,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Notice {
  id: number
  title: string
  content: string
  image_url?: string | null
  created_at: string
}

type Category =
  | "announcement"
  | "alert"
  | "event"
  | "celebration"
  | "maintenance"
  | "general"

interface CategoryMeta {
  icon: typeof Megaphone
  label: string
  accent: string
  ring: string
  chip: string
  dot: string
}

const CATEGORY_META: Record<Category, CategoryMeta> = {
  announcement: {
    icon: Megaphone,
    label: "Announcement",
    accent: "text-teal-600 dark:text-teal-300",
    ring: "ring-teal-500/30",
    chip: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
  },
  alert: {
    icon: Bell,
    label: "Alert",
    accent: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/30",
    chip: "bg-red-500/10 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  event: {
    icon: CalendarDays,
    label: "Event",
    accent: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/30",
    chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  celebration: {
    icon: PartyPopper,
    label: "Celebration",
    accent: "text-pink-600 dark:text-pink-400",
    ring: "ring-pink-500/30",
    chip: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    accent: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500/30",
    chip: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  general: {
    icon: Pin,
    label: "Notice",
    accent: "text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-500/30",
    chip: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
}

function detectCategory(title: string, content: string): Category {
  const text = `${title} ${content}`.toLowerCase()
  if (/\b(alert|urgent|immediate|warning|danger|emergency|caution|critical)\b/.test(text))
    return "alert"
  if (/\b(maintenance|downtime|outage|server|fix|patch|sysadmin)\b/.test(text))
    return "maintenance"
  if (/\b(event|schedule|class|meeting|workshop|seminar|webinar|exam|deadline)\b/.test(text))
    return "event"
  if (/\b(congrats|congratulations|celebration|achievement|winner|won|welcome|welcome!|festive)\b/.test(text))
    return "celebration"
  if (/\b(announcement|announce|introducing|launch|new|release)\b/.test(text))
    return "announcement"
  return "general"
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime()
  if (isNaN(then)) return ""
  const diff = Math.max(0, Date.now() - then)
  const sec = Math.floor(diff / 1000)
  if (sec < 30) return "just now"
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`
  const week = Math.floor(day / 7)
  if (week < 5) return `${week} week${week === 1 ? "" : "s"} ago`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month} month${month === 1 ? "" : "s"} ago`
  const year = Math.floor(day / 365)
  return `${year} year${year === 1 ? "" : "s"} ago`
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NoticesTab({ isAdmin }: { isAdmin: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const draftKeys = { title: "draft_notice_title", content: "draft_notice_content", imageUrl: "draft_notice_image" }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchNotices()
  }, [])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    try {
      const savedTitle = window.localStorage.getItem(draftKeys.title)
      const savedContent = window.localStorage.getItem(draftKeys.content)
      const savedImage = window.localStorage.getItem(draftKeys.imageUrl)
      if (savedTitle) setTitle(savedTitle)
      if (savedContent) setContent(savedContent)
      if (savedImage) setImageUrl(savedImage)
    } catch {
      // ignore storage errors
    }
  }, [showForm, editingId])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKeys.title, title)
        window.localStorage.setItem(draftKeys.content, content)
        window.localStorage.setItem(draftKeys.imageUrl, imageUrl)
      } catch {
        // ignore storage errors
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [title, content, imageUrl, showForm, editingId])

  useEffect(() => {
    if (selectedNotice) {
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
  }, [selectedNotice])

  async function fetchNotices() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setNotices(data as Notice[])
    setLoading(false)
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKeys.title)
      window.localStorage.removeItem(draftKeys.content)
      window.localStorage.removeItem(draftKeys.imageUrl)
    } catch { /* ignore */ }
  }

  function resetForm() {
    clearDraft()
    setTitle("")
    setContent("")
    setImageUrl("")
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    if (editingId !== null) {
      await getSupabase().from("notices").update({ title, content, image_url: imageUrl || null }).eq("id", editingId)
      toast.success("Notice updated.")
    } else {
      if (!title || !content) return
      await getSupabase().from("notices").insert({ title, content, image_url: imageUrl || null })
      const snippet = content.length > 120 ? `${content.slice(0, 117)}...` : content
      fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({
          title: `নতুন নোটিশ: ${title}`,
          message: snippet,
        }),
      })
      toast.success("Notice published. Push notification sent to all students.")
    }
    clearDraft()
    resetForm()
    await fetchNotices()
  }

  function startEdit(n: Notice) {
    setTitle(n.title)
    setContent(n.content)
    setImageUrl(n.image_url || "")
    setEditingId(n.id)
    setShowForm(true)
  }

  async function deleteNotice(id: number) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("notices").delete().eq("id", id)
    setNotices((prev) => prev.filter((n) => n.id !== id))
    toast.success("Notice deleted.")
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
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm shrink-0">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 truncate">
              Notice Board
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {notices.length} {notices.length === 1 ? "notice" : "notices"} pinned
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              if (showForm && editingId !== null) resetForm()
              else setShowForm(!showForm)
            }}
            variant={showForm ? "destructive" : "default"}
            className="rounded-full px-4 h-10 shrink-0"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Pin Notice
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="rounded-2xl shadow-md dark:shadow-none border border-slate-200/60 dark:border-slate-600/60 border-l-4 border-l-teal-500 dark:border-l-teal-500 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md">
          <CardContent className="p-5 space-y-3">
            <Input
              placeholder="Notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-700"
            />
            <textarea
              placeholder="Notice content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a8a] dark:focus-visible:ring-[#14b8a6] resize-none text-slate-800 dark:text-slate-100"
            />
            <Input
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-700"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={editingId === null && (!title || !content)}>
              {editingId !== null ? "Update Notice" : "Publish Notice"}
            </Button>
          </CardContent>
        </Card>
      )}

      {notices.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-slate-900/40 dark:to-teal-900/10 py-16 px-6 text-center">
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:18px_18px] text-slate-900 dark:text-white" />
          <div className="relative">
            <div className="mx-auto mb-5 h-24 w-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 flex items-center justify-center rotate-3">
              <Inbox className="h-12 w-12" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              The board is empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
              No notices have been pinned yet. New announcements will appear here.
            </p>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(true)}
                className="rounded-full px-5 h-10 mt-5 border-teal-300 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10"
              >
                <Sparkles className="h-4 w-4" /> Pin the first notice
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {notices.map((n, i) => {
            const cat = CATEGORY_META[detectCategory(n.title, n.content)]
            const CatIcon = cat.icon
            return (
              <div
                key={n.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="animate-fade-in-up"
              >
                <Card
                  onClick={() => setSelectedNotice(n)}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden",
                    "rounded-2xl border border-slate-200/60 dark:border-slate-700/60",
                    "border-l-4 border-l-teal-500 dark:border-l-teal-500",
                    "bg-white dark:bg-slate-900/80 dark:backdrop-blur-md",
                    "shadow-sm dark:shadow-none",
                    "hover:shadow-xl hover:dark:shadow-[0_0_25px_rgba(20,184,166,0.18)]",
                    "hover:dark:border-slate-600/80",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-0.5 active:scale-[0.99]"
                  )}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "shrink-0 h-10 w-10 rounded-xl ring-1 flex items-center justify-center",
                          cat.chip,
                          cat.ring
                        )}
                      >
                        <CatIcon className={cn("h-5 w-5", cat.accent)} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            cat.chip
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
                          {cat.label}
                        </span>
                        <h3 className="mt-1.5 font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-snug line-clamp-2">
                          {n.title}
                        </h3>
                        <p
                          className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1"
                          title={formatFullDate(n.created_at)}
                        >
                          <Clock className="h-3 w-3" />
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed line-clamp-3 text-slate-600 dark:text-slate-300/85">
                      {n.content}
                    </p>

                    {n.image_url && (
                      <img
                        src={n.image_url}
                        alt=""
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(n.image_url!) }}
                        className="w-full max-h-[300px] object-cover rounded-xl mt-2 cursor-pointer"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {selectedImage && mounted && createPortal(
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center animate-fade-in-up"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-[70] h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
          />
        </div>,
        document.body
      )}

      {selectedNotice && mounted && createPortal(
        (() => {
          const cat = CATEGORY_META[detectCategory(selectedNotice.title, selectedNotice.content)]
          const CatIcon = cat.icon
          return (
            <div
              onClick={() => setSelectedNotice(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg max-h-[85vh] z-50 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
              >
                <div
                  className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    cat.dot.replace("bg-", "from-"),
                    "to-transparent"
                  )}
                />

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="absolute top-3 right-3 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 backdrop-blur-sm transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="overflow-y-auto overscroll-contain thin-scroll max-h-[85vh]">
                  <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-700/30">
                    <div className="flex items-center gap-3 px-6 sm:px-7 pt-5 pb-4 pr-14">
                      <div
                        className={cn(
                          "shrink-0 h-11 w-11 rounded-2xl ring-1 flex items-center justify-center",
                          cat.chip,
                          cat.ring
                        )}
                      >
                        <CatIcon className={cn("h-5 w-5", cat.accent)} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            cat.chip
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 space-y-4 pt-5">
                    <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl sm:text-2xl tracking-tight leading-snug pr-2">
                      {selectedNotice.title}
                    </h2>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

                    <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedNotice.content}
                    </p>

                    {selectedNotice.image_url && (
                      <img
                        src={selectedNotice.image_url}
                        alt=""
                        onClick={() => setSelectedImage(selectedNotice.image_url!)}
                        className="w-full max-h-[300px] object-cover rounded-xl cursor-pointer"
                      />
                    )}

                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/70 dark:border-slate-800/80">
                        <button
                          onClick={() => {
                            setSelectedNotice(null)
                            startEdit(selectedNotice)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNotice(null)
                            deleteNotice(selectedNotice.id)
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })(),
        document.body
      )}
    </div>
  )
}
