"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import LazyImage from "@/components/ui/LazyImage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, Plus, X, FileText, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Assignment {
  id: number
  title: string
  link: string
  image_urls?: string[] | null
  image_url?: string | null
}

export default function AssignmentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([""])
  const [selectedCard, setSelectedCard] = useState<Assignment | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const draftKeys = { title: "draft_note_title", link: "draft_note_link", imageUrls: "draft_note_images" }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchAssignments()
  }, [])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    try {
      const savedTitle = window.localStorage.getItem(draftKeys.title)
      const savedLink = window.localStorage.getItem(draftKeys.link)
      const savedImages = window.localStorage.getItem(draftKeys.imageUrls)
      if (savedTitle) setTitle(savedTitle)
      if (savedLink) setLink(savedLink)
      if (savedImages) try { setImageUrls(JSON.parse(savedImages)) } catch { /* ignore */ }
    } catch {
      // ignore storage errors
    }
  }, [showForm, editingId])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKeys.title, title)
        window.localStorage.setItem(draftKeys.link, link)
        window.localStorage.setItem(draftKeys.imageUrls, JSON.stringify(imageUrls))
      } catch {
        // ignore storage errors
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [title, link, imageUrls, showForm, editingId])

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

  async function fetchAssignments() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("assignments")
      .select("*")
      .order("id", { ascending: false })
    if (data) setAssignments(data as Assignment[])
    setLoading(false)
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKeys.title)
      window.localStorage.removeItem(draftKeys.link)
      window.localStorage.removeItem(draftKeys.imageUrls)
    } catch { /* ignore */ }
  }

  function resetForm() {
    clearDraft()
    setTitle("")
    setLink("")
    setImageUrls([""])
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    const urls = imageUrls.filter((u) => u.trim() !== "")
    const payload = {
      title: title ? title : null,
      link: link ? link : null,
      image_urls: urls.length ? urls : null,
    }
    const { error } = editingId !== null
      ? await getSupabase().from("assignments").update(payload).eq("id", editingId)
      : await getSupabase().from("assignments").insert(payload)
    if (error) {
      toast.error(error.message)
      return
    }
    clearDraft()
    resetForm()
    await fetchAssignments()
      toast.success(editingId !== null ? "Note updated." : "Note published.")
    if (editingId === null) {
      fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({
          title: `নতুন নোট: ${title || "Untitled"}`,
          message: link ? "নোটের লিংক অ্যাপে যোগ হয়েছে।" : "নতুন নোট অ্যাপে যোগ হয়েছে।",
        }),
      })
    }
  }

  function startEdit(a: Assignment) {
    setTitle(a.title || "")
    setLink(a.link || "")
    if (Array.isArray(a.image_urls) && a.image_urls.length > 0) {
      setImageUrls([...a.image_urls, ""])
    } else if (a.image_url && a.image_url.trim() !== "") {
      setImageUrls([a.image_url, ""])
    } else {
      setImageUrls([""])
    }
    setEditingId(a.id)
    setShowForm(true)
  }

  async function deleteAssignment(id: number) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("assignments").delete().eq("id", id)
    setAssignments((prev) => prev.filter((a) => a.id !== id))
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
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              if (showForm && editingId !== null) resetForm()
              else setShowForm(!showForm)
            }}
            variant={showForm ? "destructive" : "default"}
            className="rounded-full px-4 h-10"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Note
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="rounded-2xl shadow-md dark:shadow-none border border-slate-200/60 dark:border-slate-600/60 border-l-4 border-l-[#facc15] dark:border-l-[#facc15] bg-white dark:bg-slate-800/60 dark:backdrop-blur-md transition-all duration-300">
          <div className="p-6 space-y-3">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Input
              type="text"
              placeholder="Google Drive / external link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <div className="space-y-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Image URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => {
                      const next = [...imageUrls]
                      next[idx] = e.target.value
                      if (idx === imageUrls.length - 1 && e.target.value) next.push("")
                      setImageUrls(next)
                    }}
                    className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70 flex-1"
                  />
                  {idx > 0 && (
                    <button
                      onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button className="w-full rounded-full h-11" onClick={handleSubmit}>
              {editingId !== null ? "Update Note" : "Publish Note"}
            </Button>
          </div>
        </Card>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-[#9ca3af]">
          <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a, i) => (
            <div
              key={a.id}
              onClick={() => setSelectedCard(a)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-in-up"
            >
              <Card className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 border-t-teal-500 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group">
                <div className="p-6 pb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-2.5 rounded-xl">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-[#e5e7eb] text-xl tracking-tight leading-snug">
                      {a.title || "Untitled Note"}
                    </h3>
                  </div>
                  {isAdmin && (
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => startEdit(a)}
                        className="text-slate-400 hover:text-[#1e3a8a] dark:hover:text-[#14b8a6] transition-colors p-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteAssignment(a.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {(Array.isArray(a.image_urls) && a.image_urls.length > 0) || (a.image_url && a.image_url.trim() !== "") ? (() => {
                  const urls = Array.isArray(a.image_urls) && a.image_urls.length > 0
                    ? a.image_urls
                    : a.image_url
                    ? [a.image_url]
                    : []
                  if (urls.length === 1) {
                    return (
                      <img
                        src={urls[0]}
                        alt=""
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(urls[0]) }}
                        className="w-full max-h-[280px] object-cover rounded-xl mt-3 mx-auto block border border-white/5 cursor-pointer"
                      />
                    )
                  }
                  return (
                    <div className="flex flex-wrap justify-center gap-3 mt-3 mx-auto">
                      {urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(url) }}
                          className="w-[110px] h-[110px] object-cover rounded-xl border border-white/10 shadow-lg cursor-pointer transition-all duration-300 ease hover:scale-105 hover:opacity-90"
                        />
                      ))}
                    </div>
                  )
                })() : null}

                {a.link && (
                  <div className="px-4 pb-6">
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      Open Note <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}

      {selectedCard && mounted && createPortal(
        <>
          <div
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto z-50 bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-9 h-9" />
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  Modules
                </h2>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:rotate-90 transition-transform text-slate-600 dark:text-slate-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(Array.isArray(selectedCard.image_urls) && selectedCard.image_urls.length > 0) || (selectedCard.image_url && selectedCard.image_url.trim() !== "") ? (
              <div className="flex flex-col gap-3 mb-2">
                {Array.isArray(selectedCard.image_urls) && selectedCard.image_urls.length > 0
                  ? selectedCard.image_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt=""
                        onClick={() => setSelectedImage(url)}
                        className="w-full max-h-[400px] object-contain rounded-xl cursor-pointer"
                      />
                    ))
                  : selectedCard.image_url && (
                      <img
                        src={selectedCard.image_url}
                        alt=""
                        onClick={() => setSelectedImage(selectedCard.image_url!)}
                        className="w-full max-h-[400px] object-contain rounded-xl cursor-pointer"
                      />
                    )}
              </div>
            ) : null}

            {selectedCard.link && (
              <a
                href={selectedCard.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Open Note <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </>,
        document.body
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
    </div>
  )
}
