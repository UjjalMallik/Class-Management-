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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e3a8a] px-2 pb-1">
      <div className="mx-auto flex max-w-3xl items-center justify-around h-16">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-[#facc15]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 relative z-10 ${
                  isActive ? "text-[#1e3a8a]" : "text-white/60"
                }`}
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide relative z-10 ${
                  isActive ? "text-[#1e3a8a]" : "text-white/60"
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
