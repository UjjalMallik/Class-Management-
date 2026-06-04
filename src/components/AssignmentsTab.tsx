"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                <Plus className="h-4 w-4" /> Add Assignment
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="border-[#facc15]/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Google Drive / external link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button className="w-full" onClick={handleSubmit}>
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
        assignments.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base text-[#1e3a8a] leading-snug">
                  {a.title || "Untitled Assignment"}
                </CardTitle>
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(a)}
                      className="text-slate-400 hover:text-[#1e3a8a] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAssignment(a.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {a.image_url && a.image_url.trim() !== "" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={`${a.title || "assignment"} image`}
                  className="w-full h-auto object-contain max-h-64 mt-3 rounded-md"
                />
              )}
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#1e3a8a] underline underline-offset-2 hover:text-[#1e3a8a]/80 transition-colors"
                >
                  Open Assignment <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
