"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, Plus, X, Link as LinkIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ClassLink {
  id: number
  class_name: string
  link_url: string
  note: string | null
}

export default function ClassLinks({ isAdmin }: { isAdmin: boolean }) {
  const [links, setLinks] = useState<ClassLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [className, setClassName] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("class_links")
      .select("*")
      .order("id", { ascending: false })
    if (data) setLinks(data as ClassLink[])
    setLoading(false)
  }

  function resetForm() {
    setClassName("")
    setLinkUrl("")
    setNote("")
    setShowForm(false)
  }

  async function handleSubmit() {
    const payload = {
      class_name: className || null,
      link_url: linkUrl || null,
      note: note || null,
    }
    const { error } = await getSupabase().from("class_links").insert(payload)
    if (error) {
      toast.error(error.message)
      return
    }
    resetForm()
    await fetchLinks()
    toast.success("Class link published.")
  }

  async function deleteLink(id: number) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("class_links").delete().eq("id", id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
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
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "destructive" : "default"}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Class Link
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="border-[#facc15]/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Class Title"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <Input
              placeholder="Class Link (URL)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <Input
              placeholder="Short Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button className="w-full" onClick={handleSubmit}>
              Save / Publish
            </Button>
          </CardContent>
        </Card>
      )}

      {links.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <LinkIcon className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No class links yet</p>
        </div>
      ) : (
        links.map((l) => (
          <Card key={l.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base text-[#1e3a8a] leading-snug">
                  {l.class_name || "Untitled"}
                </CardTitle>
                {isAdmin && (
                  <button
                    onClick={() => deleteLink(l.id)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {l.note && (
                <p className="text-sm text-slate-600">{l.note}</p>
              )}
              {l.link_url && (
                <a
                  href={l.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a8a]/90 transition-colors"
                >
                  Join Class <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
