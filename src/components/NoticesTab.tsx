"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Megaphone, Plus, X, Pencil, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"

interface Notice {
  id: number
  title: string
  content: string
  created_at: string
}

export default function NoticesTab({ isAdmin }: { isAdmin: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setNotices(data as Notice[])
    setLoading(false)
  }

  function resetForm() {
    setTitle("")
    setContent("")
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    if (editingId !== null) {
      await getSupabase().from("notices").update({ title, content }).eq("id", editingId)
      toast.success("Notice updated.")
    } else {
      if (!title || !content) return
      await getSupabase().from("notices").insert({ title, content })
      fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({ title: "New Notice Published!", message: "Check out the new notice." }),
      })
      toast.success("Notice published successfully. Push notification sent to all students.")
    }
    resetForm()
    await fetchNotices()
  }

  function startEdit(n: Notice) {
    setTitle(n.title)
    setContent(n.content)
    setEditingId(n.id)
    setShowForm(true)
  }

  async function deleteNotice(id: number) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("notices").delete().eq("id", id)
    setNotices((prev) => prev.filter((n) => n.id !== id))
    toast.success("Notice deleted.")
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
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
                <Plus className="h-4 w-4" /> New Notice
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="border-[#facc15]/40 shadow-sm rounded-2xl">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <textarea
              placeholder="Notice content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a8a] resize-none"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={editingId === null && (!title || !content)}>
              {editingId !== null ? "Update" : "Publish Notice"}
            </Button>
          </CardContent>
        </Card>
      )}

      {notices.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Megaphone className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No notices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <div
              key={n.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-in-up"
            >
              <Card
                onClick={() => setSelectedNotice(n)}
                className="cursor-pointer rounded-2xl shadow-md bg-white border-slate-200/60 border-l-4 border-l-blue-600 transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-blue-50 text-blue-600 p-2">
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-800 text-lg leading-snug">
                          {n.title}
                        </h3>
                        <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap leading-relaxed line-clamp-2">
                          {n.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDate(n.created_at)}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => startEdit(n)}
                            className="text-slate-400 hover:text-[#1e3a8a] transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selectedNotice && (
        <div
          onClick={() => setSelectedNotice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 opacity-100 relative animate-fade-in-up"
          >
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-10">
              <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(selectedNotice.created_at)}
              </span>
            </div>
            <h2 className="font-extrabold text-slate-800 text-2xl tracking-tight leading-snug mb-3">
              {selectedNotice.title}
            </h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
              {selectedNotice.content}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
