"use client"

import { Moon, Sun, ShieldCheck, Eye, EyeOff, X, AlertCircle, Calendar, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import LazyImage from "@/components/ui/LazyImage"
import {
  Dialog,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface HeaderProps {
  view: "admin" | "student"
  onViewChange: (v: "admin" | "student") => void
}

const ADMIN_STORAGE_KEY = "eub39_admin_unlocked"

function formatDate(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" })
  const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${weekday}, ${monthDay}`
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

export default function Header({ view, onViewChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (pinModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPin("")
       
      setPinError(false)
       
      setShowPin(false)
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [pinModalOpen])

  useEffect(() => {
    if (!pinError) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShaking(true)
    const t = setTimeout(() => setShaking(false), 450)
    return () => clearTimeout(t)
  }, [pinError])

  function handleToggle(checked: boolean) {
    if (checked) {
      setPinModalOpen(true)
    } else {
      try {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY)
      } catch {
        // ignore storage errors
      }
      onViewChange("student")
    }
  }

  function handleConfirm() {
    const expected = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "1234"
    if (pin === expected) {
      try {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, "true")
      } catch {
        // ignore storage errors
      }

      onViewChange("admin")
      setPinModalOpen(false)

      toast.success("অ্যাডমিন প্রবেশ সফল হয়েছে", {
        description: "পেজ রিফ্রেশ হচ্ছে...",
      })

      setTimeout(() => {
        window.location.reload()
      }, 400)
    } else {
      setPinError(true)
      setPin("")
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
      toast.error("ভুল পিন", {
        description: "অ্যাডমিন প্যানেলে প্রবেশ করতে সঠিক পিন দিন।",
      })
    }
  }

  function handleOpenChange(open: boolean) {
    setPinModalOpen(open)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] dark:bg-[#0f172a] dark:border-b dark:border-slate-700/60 dark:shadow-sm text-white shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 h-14">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <LazyImage
              src="https://i.ibb.co.com/FkPGmnMW/20260604-131246.jpg"
              alt="EUB 39 Batch logo"
              eager
              priority
              sizes="40px"
              containerClassName="w-10 h-10 rounded-lg shadow-sm border border-white/20 shrink-0 aspect-square"
              className="w-full h-full object-contain"
            />
            <div className="flex flex-col min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base sm:text-xl font-bold tracking-tight whitespace-nowrap">
                  EUB 39 Batch
                </span>
                <span className="rounded bg-[#facc15]/20 dark:bg-[#facc15]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#facc15] uppercase leading-none whitespace-nowrap shrink-0">
                  (CIVIL)
                </span>
              </div>
              {mounted && now && (
                <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap text-[10px] sm:text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{formatDate(now)}</span>
                  <span className="opacity-40">|</span>
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{formatTime(now)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <span className="text-xs font-medium uppercase tracking-wide whitespace-nowrap">
              {view === "admin" ? "Admin" : "Student"}
            </span>
            <Switch
              checked={view === "admin"}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </header>

      <Dialog open={pinModalOpen} onOpenChange={handleOpenChange}>
        <DialogPortal>
          <div
            aria-hidden
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: "color-mix(in oklab, var(--bg) 55%, transparent)",
              backdropFilter: "blur(10px) saturate(140%)",
              WebkitBackdropFilter: "blur(10px) saturate(140%)",
              animation: "overlayIn 220ms ease-out both",
            }}
          />

          <div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
            style={{
              transform: "translate(-50%, -50%)",
              animation: "modalIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div
              className="relative"
              style={{
                animation: shaking
                  ? "shake 420ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both"
                  : undefined,
              }}
            >
              <div
                className="absolute -inset-px rounded-2xl opacity-70 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--accent) 35%, transparent), transparent 50%, color-mix(in oklab, var(--accent) 25%, transparent))",
                }}
              />
              <div
                className="relative overflow-hidden rounded-2xl border shadow-2xl"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: pinError ? "#ef4444" : "var(--border)",
                  boxShadow:
                    "0 25px 60px -20px rgba(0,0,0,0.35), 0 2px 6px -2px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full"
                  style={{
                    background:
                      "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 28%, transparent), transparent 70%)",
                    filter: "blur(20px)",
                  }}
                />

                <button
                  onClick={() => handleOpenChange(false)}
                  className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative px-6 pt-7 pb-6 flex flex-col items-center text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        "color-mix(in oklab, var(--accent) 14%, transparent)",
                      border:
                        "1px solid color-mix(in oklab, var(--accent) 30%, transparent)",
                      animation: "iconPulse 2.4s ease-in-out infinite",
                    }}
                  >
                    <ShieldCheck
                      className="h-7 w-7"
                      style={{ color: "var(--accent)" }}
                      strokeWidth={2}
                    />
                  </div>

                  <DialogTitle
                    className="text-xl font-bold tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    অ্যাডমিন এক্সেস
                  </DialogTitle>
                  <DialogDescription
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার পিন দিন
                  </DialogDescription>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleConfirm()
                    }}
                    className="w-full mt-6"
                  >
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        autoComplete="off"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value)
                          if (pinError) setPinError(false)
                        }}
                        maxLength={12}
                        placeholder="• • • •"
                        className="w-full rounded-xl border bg-transparent px-4 py-3.5 text-center text-lg font-semibold outline-none transition-all"
                        style={{
                          borderColor: pinError
                            ? "#ef4444"
                            : "var(--border)",
                          color: "var(--text-primary)",
                          letterSpacing: showPin ? "0.25em" : "0.4em",
                          boxShadow: pinError
                            ? "0 0 0 4px color-mix(in oklab, #ef4444 12%, transparent)"
                            : "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                        onFocus={(e) => {
                          if (!pinError) {
                            e.currentTarget.style.borderColor = "var(--accent)"
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px color-mix(in oklab, var(--accent) 15%, transparent)"
                          }
                        }}
                        onBlur={(e) => {
                          if (!pinError) {
                            e.currentTarget.style.borderColor = "var(--border)"
                            e.currentTarget.style.boxShadow =
                              "0 1px 2px rgba(0,0,0,0.04)"
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        aria-label={showPin ? "Hide PIN" : "Show PIN"}
                        tabIndex={-1}
                      >
                        {showPin ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {pinError && (
                      <div
                        className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-medium"
                        style={{ color: "#ef4444" }}
                        role="alert"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>ভুল পিন, আবার চেষ্টা করুন</span>
                      </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        className="h-11 rounded-xl font-medium"
                      >
                        বাতিল
                      </Button>
                      <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={pin.length === 0}
                        className="h-11 rounded-xl font-semibold disabled:opacity-50"
                      >
                        নিশ্চিত করুন
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  )
}
