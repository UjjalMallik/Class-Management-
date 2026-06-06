"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import LazyImage from "@/components/ui/LazyImage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, Plus, X, FileText, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Assignment {
  id: number
  title: string
  link: string
  image_url: string | null
}

export default function AssignmentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedCard, setSelectedCard] = useState<Assignment | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchAssignments()
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

  async function fetchAssignments() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("assignments")
      .select("*")
      .order("id", { ascending: false })
    if (data) setAssignments(data as Assignment[])
    setLoading(false)
  }

  function resetForm() {
    setTitle("")
    setLink("")
    setImageUrl("")
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    const payload = {
      title: title ? title : null,
      link: link ? link : null,
      image_url: imageUrl ? imageUrl : null,
    }
    const { error } = editingId !== null
      ? await getSupabase().from("assignments").update(payload).eq("id", editingId)
      : await getSupabase().from("assignments").insert(payload)
    if (error) {
      toast.error(error.message)
      return
    }
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
    setImageUrl(a.image_url || "")
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
          <CardContent className="p-6 space-y-3">
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
            <Input
              type="text"
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit}>
              {editingId !== null ? "Update Note" : "Publish Note"}
            </Button>
          </CardContent>
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
              <Card className="cursor-pointer rounded-2xl shadow-md dark:shadow-none border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md hover:dark:border-teal-500/30 hover:dark:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-lg group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-3 rounded-2xl">
                        <FileText className="h-6 w-6" />
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

                  {a.image_url && a.image_url.trim() !== "" && (
                    <div className="bg-slate-50 dark:bg-[#0a0b10] rounded-2xl border border-slate-200 dark:border-[#374151] p-2">
                      <LazyImage
                        src={a.image_url}
                        alt={`${a.title || "note"} image`}
                        containerClassName="w-full rounded-xl min-h-40"
                        className="w-full h-auto object-contain rounded-xl max-h-64"
                      />
                    </div>
                  )}

                  {a.link && (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-[#14b8a6] dark:to-[#0d9488] hover:from-indigo-700 hover:to-blue-700 dark:hover:from-[#0d9488] dark:hover:to-[#0f766e] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Open Note <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
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
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-800 dark:text-[#e5e7eb] text-xl tracking-tight leading-snug">
                {selectedCard.title || "Untitled Note"}
              </h2>
            </div>

            {selectedCard.image_url && selectedCard.image_url.trim() !== "" && (
              <div className="bg-slate-50 dark:bg-[#0a0b10] rounded-2xl border border-slate-200 dark:border-[#374151] p-2 mb-3">
                <LazyImage
                  src={selectedCard.image_url}
                  alt={`${selectedCard.title || "note"} image`}
                  eager
                  containerClassName="w-full rounded-xl min-h-40"
                  className="w-full h-auto max-h-[calc(90vh-180px)] object-contain rounded-xl"
                />
              </div>
            )}

            {selectedCard.link && (
              <a
                href={selectedCard.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-[#14b8a6] dark:to-[#0d9488] hover:from-indigo-700 hover:to-blue-700 dark:hover:from-[#0d9488] dark:hover:to-[#0f766e] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Open Note <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
