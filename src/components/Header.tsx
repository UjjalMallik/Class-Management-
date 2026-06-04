"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"

interface HeaderProps {
  view: "admin" | "student"
  onViewChange: (v: "admin" | "student") => void
}

export default function Header({ view, onViewChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  function handleToggle(checked: boolean) {
    if (checked) {
      const pin = window.prompt("Enter Admin PIN:")
      if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
        onViewChange("admin")
      } else {
        alert("Incorrect PIN. Access Denied.")
      }
    } else {
      onViewChange("student")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] dark:bg-[#0f172a] text-white shadow-lg">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.ibb.co.com/FkPGmnMW/20260604-131246.jpg"
            alt="EUB 39 Batch logo"
            className="w-9 h-9 rounded-lg object-cover shadow-sm border border-white/20"
          />
          <span className="text-lg font-bold tracking-tight">EUB 39 Batch</span>
          <span className="rounded bg-[#facc15]/20 dark:bg-[#facc15]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#facc15] uppercase leading-none">
            (CIVIL)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <span className="text-xs font-medium uppercase tracking-wide">
            {view === "admin" ? "Admin" : "Student"}
          </span>
          <Switch
            checked={view === "admin"}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
    </header>
  )
}
