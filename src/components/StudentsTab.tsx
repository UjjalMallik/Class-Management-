"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Users, Plus, X, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Student {
  id: number
  name: string
  student_id: string
}

export default function StudentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    const { data } = await getSupabase().from("users").select("*").order("name")
    if (data) setStudents(data as Student[])
    setLoading(false)
  }

  function resetForm() {
    setName("")
    setStudentId("")
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    if (editingId !== null) {
      await getSupabase().from("users").update({ name, student_id: studentId }).eq("id", editingId)
      toast.success("Student updated.")
    } else {
      if (!name || !studentId) return
      await getSupabase().from("users").insert({ name, student_id: studentId })
      toast.success(`${name} added to the class.`)
    }
    resetForm()
    await fetchStudents()
  }

  function startEdit(s: Student) {
    setName(s.name)
    setStudentId(s.student_id)
    setEditingId(s.id)
    setShowForm(true)
  }

  async function deleteStudent(id: number, studentName: string) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("users").delete().eq("id", id)
    setStudents((prev) => prev.filter((s) => s.id !== id))
    toast.success(`${studentName} removed from the class.`)
  }

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full pl-10 pr-4 h-11 bg-white shadow-sm border-slate-200/70 focus-visible:ring-[#1e3a8a]/30 focus-visible:border-[#1e3a8a]/40"
          />
        </div>
        {isAdmin && (
          <Button
            size="icon"
            onClick={() => {
              if (showForm && editingId !== null) resetForm()
              else setShowForm(!showForm)
            }}
            variant={showForm ? "destructive" : "default"}
            className="rounded-full h-11 w-11 shrink-0"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-[#facc15]/40 shadow-sm rounded-2xl">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={editingId === null && (!name || !studentId)}>
              {editingId !== null ? "Update" : "Add Student"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-[#1e3a8a] text-lg">{filtered.length}</span>{" "}
          student{filtered.length !== 1 ? "s" : ""}
          {search && students.length !== filtered.length && (
            <span className="text-slate-400"> of {students.length}</span>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">{search ? "No students match your search" : "No students found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              className="animate-fade-in-up"
            >
              <Card
                className="rounded-2xl shadow-sm border-slate-200/60 bg-white transition-all duration-300 ease-out active:scale-[0.98] hover:-translate-y-1 hover:shadow-lg group"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base shadow-sm transition-all duration-300 ease-out group-hover:shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_0_18px_rgba(99,102,241,0.35)] group-hover:scale-105">
                      {s.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-semibold text-gray-800 text-lg truncate">
                      {s.name}
                    </span>
                  </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {s.student_id}
                  </span>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => startEdit(s)}
                        className="text-slate-400 hover:text-[#1e3a8a] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteStudent(s.id, s.name)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
