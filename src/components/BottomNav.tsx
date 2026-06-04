"use client"

import { motion } from "framer-motion"
import { CalendarCheck, FileText, Users, Megaphone, Link } from "lucide-react"

const tabs = [
  { key: "routine", label: "Routine", icon: CalendarCheck },
  { key: "classLinks", label: "Class Links", icon: Link },
  { key: "assignments", label: "Assignments", icon: FileText },
  { key: "students", label: "Students", icon: Users },
  { key: "notices", label: "Notices", icon: Megaphone },
] as const

export type TabKey = (typeof tabs)[number]["key"]

interface BottomNavProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e3a8a] dark:bg-[#0f172a] px-1 pb-1 sm:px-2">
      <div className="mx-auto grid max-w-3xl grid-cols-5 items-center h-16 gap-0.5">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-0.5 min-[380px]:px-1 sm:px-2 py-1 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-[#facc15] dark:bg-[#14b8a6]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 relative z-10 ${
                  isActive ? "text-[#1e3a8a] dark:text-[#0a0b10]" : "text-white/60"
                }`}
              />
              <span
                className={`font-semibold uppercase relative z-10 w-full text-center truncate text-[9px] tracking-tight min-[380px]:text-[10px] min-[380px]:tracking-wide sm:text-xs ${
                  isActive ? "text-[#1e3a8a] dark:text-[#0a0b10]" : "text-white/60"
                }`}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
