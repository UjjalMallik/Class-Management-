"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"
import type { TabKey } from "@/components/BottomNav"
import RoutineTab from "@/components/RoutineTab"
import ClassLinks from "@/components/ClassLinks"
import AssignmentsTab from "@/components/AssignmentsTab"
import StudentsTab from "@/components/StudentsTab"
import NoticesTab from "@/components/NoticesTab"
import PullToRefresh from "@/components/PullToRefresh"
import VisibilityReload from "@/components/VisibilityReload"

const ADMIN_STORAGE_KEY = "eub39_admin_unlocked"

export default function Home() {
  const [view, setView] = useState<"admin" | "student">("student")
  const [activeTab, setActiveTab] = useState<TabKey>("routine")

  useEffect(() => {
    try {
      if (window.localStorage.getItem(ADMIN_STORAGE_KEY) === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView("admin")
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const isAdmin = view === "admin"

  return (
    <div className="mx-auto max-w-3xl">
      <VisibilityReload />

      <Header view={view} onViewChange={setView} />

      <main className="px-4 pt-20 pb-24">
        <PullToRefresh>
          {activeTab === "routine" && <RoutineTab isAdmin={isAdmin} />}
          {activeTab === "classLinks" && <ClassLinks isAdmin={isAdmin} />}
          {activeTab === "assignments" && <AssignmentsTab isAdmin={isAdmin} />}
          {activeTab === "students" && <StudentsTab isAdmin={isAdmin} />}
          {activeTab === "notices" && <NoticesTab isAdmin={isAdmin} />}
        </PullToRefresh>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
