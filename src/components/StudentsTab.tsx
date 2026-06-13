"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getSupabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Users, Plus, X, Trash2, Pencil, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import LazyImage from "@/components/ui/LazyImage"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Student {
  id: number
  name: string
  student_id: string
  image_url?: string | null
  position?: number | null
}

function SortableStudentCard({
  student,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
  priority,
}: {
  student: Student
  isAdmin: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  priority?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`cursor-pointer ${isDragging ? "z-50" : ""}`}
    >
      <Card
        className={`rounded-2xl shadow-md dark:shadow-none border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md hover:dark:border-teal-500/30 hover:dark:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-lg group ${
          isDragging ? "shadow-2xl scale-[1.03] border-teal-400 dark:border-teal-400" : ""
        }`}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            {isAdmin && (
              <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-grab active:cursor-grabbing touch-none shrink-0"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden aspect-square transition-all duration-300 ease-out group-hover:scale-105 shadow-sm group-hover:shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_0_18px_rgba(99,102,241,0.35)]">
              {student.image_url ? (
                <LazyImage
                  src={student.image_url}
                  alt={student.name}
                  priority={priority}
                  sizes="44px"
                  containerClassName="w-full h-full rounded-full"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center">
                  {student.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span className="font-semibold text-gray-800 dark:text-[#e5e7eb] text-lg truncate">
              {student.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-indigo-50 dark:bg-[#1c1d29] text-indigo-700 dark:text-teal-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              {student.student_id}
            </span>
            {isAdmin && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="text-slate-400 hover:text-[#1e3a8a] dark:hover:text-teal-400 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function StudentsTab({ isAdmin }: { isAdmin: boolean }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [mounted, setMounted] = useState(false)

  const draftKeys = { name: "draft_student_name", studentId: "draft_student_id", imageUrl: "draft_student_image" }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    fetchStudents()
  }, [])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    try {
      const savedName = window.localStorage.getItem(draftKeys.name)
      const savedId = window.localStorage.getItem(draftKeys.studentId)
      const savedImage = window.localStorage.getItem(draftKeys.imageUrl)
      if (savedName) setName(savedName)
      if (savedId) setStudentId(savedId)
      if (savedImage) setImageUrl(savedImage)
    } catch {
      // ignore storage errors
    }
  }, [showForm, editingId])

  useEffect(() => {
    if (!showForm || editingId !== null) return
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKeys.name, name)
        window.localStorage.setItem(draftKeys.studentId, studentId)
        window.localStorage.setItem(draftKeys.imageUrl, imageUrl)
      } catch {
        // ignore storage errors
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [name, studentId, imageUrl, showForm, editingId])

  useEffect(() => {
    if (selectedStudent) {
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
  }, [selectedStudent])

  async function fetchStudents() {
    setLoading(true)
    const { data } = await getSupabase()
      .from("students")
      .select("*")
      .order("position", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
    if (data) setStudents(data as Student[])
    setLoading(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = students.findIndex((s) => s.id === active.id)
    const newIndex = students.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(students, oldIndex, newIndex)
    setStudents(newOrder)

    const updates = newOrder.map((s, i) => ({ id: s.id, position: i }))
    const { error } = await getSupabase().from("students").upsert(updates, { onConflict: "id" })

    if (error) {
      toast.error("Failed to save new order")
      await fetchStudents()
    } else {
      toast.success("Order updated")
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKeys.name)
      window.localStorage.removeItem(draftKeys.studentId)
      window.localStorage.removeItem(draftKeys.imageUrl)
    } catch { /* ignore */ }
  }

  function resetForm() {
    clearDraft()
    setName("")
    setStudentId("")
    setImageUrl("")
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit() {
    const payload = {
      name,
      student_id: studentId,
      image_url: imageUrl || null,
    }
    if (editingId !== null) {
      const { data, error } = await getSupabase()
        .from("students")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single()
      if (error) {
        toast.error(error.message)
        return
      }
      if (data) {
        const updated = data as Student
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      }
      toast.success("Student updated.")
    } else {
      if (!name || !studentId) return
      const maxPosition = students.reduce(
        (max, s) => (typeof s.position === "number" && s.position > max ? s.position : max),
        -1
      )
      const { data, error } = await getSupabase()
        .from("students")
        .insert({ ...payload, position: maxPosition + 1 })
        .select("*")
        .single()
      if (error) {
        toast.error(error.message)
        return
      }
      if (data) {
        const created = data as Student
        setStudents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      }
      toast.success(`${name} added to the class.`)
    }
    clearDraft()
    resetForm()
    await fetchStudents()
  }

  function startEdit(s: Student) {
    setName(s.name)
    setStudentId(s.student_id)
    setImageUrl(s.image_url || "")
    setEditingId(s.id)
    setShowForm(true)
  }

  async function deleteStudent(id: number, studentName: string) {
    if (!window.confirm("Are you sure you want to delete this?")) return
    await getSupabase().from("students").delete().eq("id", id)
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
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-[#14b8a6]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-[#9ca3af] pointer-events-none" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full pl-10 pr-4 h-11 bg-white dark:bg-slate-900/40 dark:backdrop-blur-md shadow-sm border-slate-200/70 dark:border-white/5 focus-visible:ring-[#1e3a8a]/30 dark:focus-visible:ring-teal-500/40 focus-visible:border-[#1e3a8a]/40 dark:focus-visible:border-teal-500/40"
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
            <Input
              placeholder="Image URL (Optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-full px-4 h-11 bg-slate-50/60 border-slate-200/70"
            />
            <Button className="w-full rounded-full h-11" onClick={handleSubmit} disabled={editingId === null && (!name || !studentId)}>
              {editingId !== null ? "Update" : "Add Student"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500 dark:text-[#9ca3af]">
          <span className="font-semibold text-[#1e3a8a] dark:text-teal-400 text-lg">{filtered.length}</span>{" "}
          student{filtered.length !== 1 ? "s" : ""}
          {search && students.length !== filtered.length && (
            <span className="text-slate-400 dark:text-[#9ca3af]"> of {students.length}</span>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-[#9ca3af]">
          <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">{search ? "No students match your search" : "No students found"}</p>
        </div>
      ) : isAdmin ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filtered.map((s, i) => (
                <div
                  key={s.id}
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                  className="animate-fade-in-up"
                >
                  <SortableStudentCard
                    student={s}
                    isAdmin={isAdmin}
                    priority={i < 3}
                    onSelect={() => setSelectedStudent(s)}
                    onEdit={() => startEdit(s)}
                    onDelete={() => deleteStudent(s.id, s.name)}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              className="animate-fade-in-up cursor-pointer"
            >
              <Card
                className="rounded-2xl shadow-md dark:shadow-none border-slate-200/60 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 dark:backdrop-blur-md hover:dark:border-teal-500/30 hover:dark:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-lg group"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden aspect-square transition-all duration-300 ease-out group-hover:scale-105 shadow-sm group-hover:shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_0_18px_rgba(99,102,241,0.35)]">
                      {s.image_url ? (
                        <LazyImage
                          src={s.image_url}
                          alt={s.name}
                          priority={i < 3}
                          sizes="44px"
                          containerClassName="w-full h-full rounded-full"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center">
                          {s.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-[#e5e7eb] text-lg truncate">
                      {s.name}
                    </span>
                  </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-indigo-50 dark:bg-[#1c1d29] text-indigo-700 dark:text-teal-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {s.student_id}
                  </span>
                </div>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>
      )}

      {selectedStudent && mounted && createPortal(
        <div
          onClick={() => setSelectedStudent(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in-up"
          >
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-md transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-6 mb-4 mx-auto text-center px-6 pb-6">
              <div className="relative mx-auto w-max mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 blur-xl opacity-50 dark:opacity-70 rounded-full" />
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-teal-400 via-indigo-500 to-purple-500 shadow-lg">
                  <div className="p-1 bg-white dark:bg-[#0f172a] rounded-full">
                    {selectedStudent.image_url ? (
                      <LazyImage
                        src={selectedStudent.image_url}
                        alt={selectedStudent.name}
                        eager
                        sizes="128px"
                        containerClassName="w-32 h-32 rounded-full aspect-square"
                        className="w-32 h-32 rounded-full object-cover border-none"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-4xl flex items-center justify-center border-none">
                        {selectedStudent.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-gray-900 dark:text-white">
                {selectedStudent.name}
              </h3>

              <span className="mt-3 inline-block px-5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-mono text-sm shadow-sm">
                ID: {selectedStudent.student_id}
              </span>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4 pb-4">
                Department of Civil Engineering
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
