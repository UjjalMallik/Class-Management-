"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
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

  useEffect(() => {
    fetchAssignments()
  }, [])

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
    toast.success(editingId !== null ? "Assignment updated." : "Assignment published.")
    if (editingId === null) {
      fetch("/api/notify", {
        method: "POST",
        body: JSON.stringify({ title: "New Assignment Added!", message: "Check out the new assignment." }),
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
                <Plus className="h-4 w-4" /> Add Assignment
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="rounded-3xl shadow-md border-[#facc15]/40 bg-white border border-slate-100/50 transition-all duration-300">
          <CardContent className="p-6 space-y-3">
            <Input
              placeholder="Assignment title"
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
              {editingId !== null ? "Update" : "Publish Assignment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No assignments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <Card
              key={a.id}
              onClick={() => setSelectedCard(a)}
              className="cursor-pointer rounded-3xl shadow-md hover:shadow-lg bg-white border border-slate-100/50 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 p-3 rounded-2xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-xl tracking-tight leading-snug">
                      {a.title || "Untitled Assignment"}
                    </h3>
                  </div>
                  {isAdmin && (
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => startEdit(a)}
                        className="text-slate-400 hover:text-[#1e3a8a] transition-colors p-1"
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
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.image_url}
                      alt={`${a.title || "assignment"} image`}
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
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Open Assignment <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 opacity-100 relative origin-center animate-fade-in-up max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-10">
              <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 p-3 rounded-2xl">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-2xl tracking-tight leading-snug">
                {selectedCard.title || "Untitled Assignment"}
              </h2>
            </div>

            {selectedCard.image_url && selectedCard.image_url.trim() !== "" && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCard.image_url}
                  alt={`${selectedCard.title || "assignment"} image`}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            )}

            {selectedCard.link && (
              <a
                href={selectedCard.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Open Assignment <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
