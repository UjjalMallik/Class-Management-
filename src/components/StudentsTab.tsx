"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              if (showForm && editingId !== null) resetForm()
              else setShowForm(!showForm)
            }}
            variant={showForm ? "destructive" : "default"}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-[#facc15]/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <Button className="w-full" onClick={handleSubmit} disabled={editingId === null && (!name || !studentId)}>
              {editingId !== null ? "Update" : "Add Student"}
            </Button>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">{search ? "No students match your search" : "No students found"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Card key={s.id} className="py-0">
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-slate-800">{s.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {s.student_id}
                  </Badge>
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
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
