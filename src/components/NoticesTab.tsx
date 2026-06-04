"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Megaphone, Plus, X, Pencil, Trash2 } from "lucide-react"
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
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              if (showForm && editingId !== null) resetForm()
              else setShowForm(!showForm)
            }}
            variant={showForm ? "destructive" : "default"}
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
        <Card className="border-[#facc15]/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Notice content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-md border border-[#1e3a8a]/20 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e3a8a] resize-none"
            />
            <Button className="w-full" onClick={handleSubmit} disabled={editingId === null && (!title || !content)}>
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
        notices.map((n) => (
          <Card key={n.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base text-[#1e3a8a] leading-snug">
                  {n.title}
                </CardTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(n.created_at)}
                  </span>
                  {isAdmin && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {n.content}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
