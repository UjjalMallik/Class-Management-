"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MonitorPlay, Plus, X, Link as LinkIcon, Trash2, Clock, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { notifyNewContent } from "@/lib/notifications"

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

  const draftKeys = { className: "draft_class_name", linkUrl: "draft_class_url", note: "draft_class_note" }

  useEffect(() => {
    fetchLinks()
  }, [])

  useEffect(() => {
    if (!showForm) return
    try {
      const savedName = window.localStorage.getItem(draftKeys.className)
      const savedUrl = window.localStorage.getItem(draftKeys.linkUrl)
      const savedNote = window.localStorage.getItem(draftKeys.note)
      if (savedName) setClassName(savedName)
      if (savedUrl) setLinkUrl(savedUrl)
      if (savedNote) setNote(savedNote)
    } catch {
      // ignore storage errors
    }
  }, [showForm])

  useEffect(() => {
    if (!showForm) return
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKeys.className, className)
        window.localStorage.setItem(draftKeys.linkUrl, linkUrl)
        window.localStorage.setItem(draftKeys.note, note)
      } catch {
        // ignore storage errors
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [className, linkUrl, note, showForm])

  async function fetchLinks() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("class_links")
      .select("*")
      .order("id", { ascending: false })
    if (data) setLinks(data as ClassLink[])
    setLoading(false)
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKeys.className)
      window.localStorage.removeItem(draftKeys.linkUrl)
      window.localStorage.removeItem(draftKeys.note)
    } catch { /* ignore */ }
  }

  function resetForm() {
    clearDraft()
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
    clearDraft()
    resetForm()
    await fetchLinks()
    try {
      await notifyNewContent({
        title: "New Class Link Added!",
        body: `${className || "Untitled"}: ${note || "অ্যাপে ঢুকে ক্লাসে যোগ দিন।"}`,
        type: "class_link",
      })
    } catch (error) {
      console.error("Class-link push notification failed:", error)
    }
  }

  async function deleteLink(id: number) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("class_links").delete().eq("id", id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
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
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            variant={showForm ? "destructive" : "default"}
            className="rounded-full px-4 h-10"
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
        <Card className="rounded-2xl shadow-md dark:shadow-none border border-slate-200/60 dark:border-slate-600/60 border-l-4 border-l-[#facc15] dark:border-l-[#facc15] bg-white dark:bg-slate-800/60 dark:backdrop-blur-md">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Class Title"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Input
              placeholder="Class Link (URL)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Input
              placeholder="Short Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit}>
              Save / Publish
            </Button>
          </CardContent>
        </Card>
      )}

      {links.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-[#9ca3af]">
          <LinkIcon className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No class links yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((l, i) => (
            <div
              key={l.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-in-up"
            >
              <Card className="rounded-2xl shadow-md dark:shadow-none border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md hover:dark:border-teal-500/30 hover:dark:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-lg group">
                <CardContent className="p-5 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-[#1c1d29] dark:to-[#1c1d29] text-indigo-600 dark:text-[#14b8a6] p-3 rounded-2xl">
                        <MonitorPlay className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-[#e5e7eb] text-xl tracking-tight leading-snug">
                          {l.class_name || "Untitled"}
                        </h3>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteLink(l.id)}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {l.note && (
                    <div className="text-sm text-slate-500 dark:text-[#9ca3af] font-medium flex items-center gap-2 mt-2 mb-4">
                      <Clock className="h-4 w-4 text-slate-400 dark:text-[#9ca3af] shrink-0" />
                      <span className="line-clamp-2">{l.note}</span>
                    </div>
                  )}

                  {l.link_url && (
                    <a
                      href={l.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-[#14b8a6] dark:to-[#0d9488] hover:from-indigo-700 hover:to-blue-700 dark:hover:from-[#0d9488] dark:hover:to-[#0f766e] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      Join Class <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
