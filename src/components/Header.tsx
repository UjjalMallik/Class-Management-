"use client"

import { Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface HeaderProps {
  view: "admin" | "student"
  onViewChange: (v: "admin" | "student") => void
}

export default function Header({ view, onViewChange }: HeaderProps) {
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

  const handleNotificationClick = () => {
    if (typeof window !== "undefined" && window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          await OneSignal.Slidedown.promptPush({ force: true });
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      alert("Notification system is loading. Please try again in 3 seconds.");
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] text-white shadow-lg">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">Class Companion</span>
          <span className="rounded bg-[#facc15]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#facc15] uppercase leading-none">
            CE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNotificationClick}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            aria-label="Subscribe to notifications"
          >
            <Bell className="h-4 w-4" />
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
