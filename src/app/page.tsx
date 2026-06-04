"use client"

import { useState } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import type { TabKey } from "@/components/BottomNav"
import RoutineTab from "@/components/RoutineTab"
import ClassLinks from "@/components/ClassLinks"
import AssignmentsTab from "@/components/AssignmentsTab"
import StudentsTab from "@/components/StudentsTab"
import NoticesTab from "@/components/NoticesTab"

export default function Home() {
  const [view, setView] = useState<"admin" | "student">("student")
  const [activeTab, setActiveTab] = useState<TabKey>("routine")

  const isAdmin = view === "admin"

  return (
    <div className="mx-auto max-w-3xl">
      <Header view={view} onViewChange={setView} />

      <main className="px-4 pt-20 pb-24">
        {activeTab === "routine" && <RoutineTab isAdmin={isAdmin} />}
        {activeTab === "classLinks" && <ClassLinks isAdmin={isAdmin} />}
        {activeTab === "assignments" && <AssignmentsTab isAdmin={isAdmin} />}
        {activeTab === "students" && <StudentsTab isAdmin={isAdmin} />}
        {activeTab === "notices" && <NoticesTab isAdmin={isAdmin} />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
