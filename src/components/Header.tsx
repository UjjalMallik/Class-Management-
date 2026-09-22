"use client"

import { Moon, Sun, ShieldCheck, Eye, EyeOff, X, AlertCircle, Calendar, Clock, Globe, Menu, ExternalLink, Info, MessageSquare, Send, Loader2, Download, Sparkles, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import packageJson from "../../package.json"
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

declare global {
  interface Window {
    cordova?: {
      InAppBrowser?: {
        open: (url: string, target: string, options: string) => unknown
      }
    }
  }
}

const ADMIN_STORAGE_KEY = "eub39_admin_unlocked"
const appVersion = String(packageJson.version).trim()
const latestReleaseApiUrl = "https://api.github.com/repos/UjjalMallik/Class-Management-/releases/latest"

interface GitHubRelease {
  tag_name: string
  html_url: string
  assets?: Array<{
    name: string
    browser_download_url: string
  }>
}

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, "")
}

function versionParts(version: string): number[] {
  return normalizeVersion(version).split(".").map((part) => Number.parseInt(part, 10) || 0)
}

function isNewerVersion(latestVersion: string, currentVersion: string): boolean {
  const latest = versionParts(latestVersion)
  const current = versionParts(currentVersion)
  const length = Math.max(latest.length, current.length)

  for (let index = 0; index < length; index += 1) {
    if ((latest[index] ?? 0) !== (current[index] ?? 0)) {
      return (latest[index] ?? 0) > (current[index] ?? 0)
    }
  }

  return false
}

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null)
  const [updateStatus, setUpdateStatus] = useState<"checking" | "up-to-date" | "update-available">("checking")
  const [downloadStarting, setDownloadStarting] = useState(false)
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
    if (!aboutModalOpen) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLatestRelease(null)
    setUpdateStatus("checking")
    setDownloadStarting(false)

    fetch(latestReleaseApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check for updates")
        return response.json() as Promise<GitHubRelease>
      })
      .then((release) => {
        if (cancelled) return

        if (!release.tag_name) {
          setUpdateStatus("up-to-date")
          return
        }

        if (isNewerVersion(release.tag_name, appVersion) && release.html_url) {
          setLatestRelease(release)
          setUpdateStatus("update-available")
        } else {
          setUpdateStatus("up-to-date")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUpdateStatus("up-to-date")
        }
      })

    return () => {
      cancelled = true
    }
  }, [aboutModalOpen])

  function startApkDownload() {
    const apkUrl = latestRelease?.assets?.find((asset) => asset.name.toLowerCase().endsWith(".apk"))?.browser_download_url
    if (!apkUrl || downloadStarting) return

    setDownloadStarting(true)
    if (window.cordova?.InAppBrowser) {
      window.cordova.InAppBrowser.open(apkUrl, "_system", "location=no,zoom=no")
    } else {
      window.open(apkUrl, "_system", "noopener,noreferrer")
    }

    window.setTimeout(() => setDownloadStarting(false), 2500)
  }

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
    const expected = process.env.NEXT_PUBLIC_ADMIN_PIN
    if (expected && pin === expected) {
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

  function openPortal() {
    const portalUrl = "https://iems.eub.edu.bd/"
    if (window.cordova && window.cordova.InAppBrowser) {
      window.cordova.InAppBrowser.open(
        portalUrl,
        "_blank",
        "location=no,zoom=no,toolbar=yes,toolbarcolor=#0f172a,navigationbuttoncolor=#ffffff,closebuttoncaption=< Back",
      )
    } else {
      window.open(portalUrl, "_blank", "noopener,noreferrer")
    }
  }

  async function handleFeedbackSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = feedback.trim()
    if (!message || feedbackSending) return

    setFeedbackSending(true)
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "322a2b05-788a-4eda-bee1-1303f0c22c70",
          subject: "New Anonymous Feedback from EUB 39B App",
          message,
        }),
      })
      const result = await response.json().catch(() => ({})) as { success?: boolean; message?: string }
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Could not send feedback.")
      }

      toast.success("Thank you for your feedback!")
      setFeedback("")
      setFeedbackModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send feedback.")
    } finally {
      setFeedbackSending(false)
    }
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
          <div className="relative flex items-center gap-1.5 shrink-0">
            <button
              onClick={openPortal}
              className="rounded-full p-2 hover:bg-white/10 transition-colors"
              aria-label="Open Student Portal"
              title="Student Portal"
            >
              <Globe className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full p-2 hover:bg-white/10 transition-colors"
              aria-label="Open header menu"
              aria-expanded={menuOpen}
              aria-controls="header-menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div
                id="header-menu"
                className="absolute right-0 top-12 w-56 rounded-xl border border-white/15 bg-[#173477] p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-3 py-1">
                  <span className="text-sm font-medium">Appearance</span>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {mounted && theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="text-sm font-medium">
                    {view === "admin" ? "Admin" : "Student"}
                  </span>
                  <Switch
                    checked={view === "admin"}
                    onCheckedChange={handleToggle}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setFeedbackModalOpen(true)
                  }}
                  className="mt-3 flex w-full items-center gap-2.5 border-t border-white/10 pt-3 text-left text-sm font-medium transition-colors hover:text-[#facc15]"
                >
                  <MessageSquare className="h-4 w-4 text-[#facc15]" />
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setAboutModalOpen(true)
                  }}
                  className="mt-3 flex w-full items-center gap-2.5 border-t border-white/10 pt-3 text-left text-sm font-medium transition-colors hover:text-[#facc15]"
                >
                  <Info className="h-4 w-4 text-[#facc15]" />
                  About
                </button>
              </div>
            )}
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

      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogPortal>
          <div
            aria-hidden
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700/70 dark:bg-slate-900">
              <form onSubmit={handleFeedbackSubmit}>
                <div className="relative isolate overflow-hidden rounded-t-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6 pb-14 pt-7 text-white sm:px-8">
                  <div aria-hidden className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    aria-label="Close Feedback dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white shadow-lg backdrop-blur-md">
                    <MessageSquare className="h-7 w-7" strokeWidth={2.2} />
                  </div>
                  <DialogTitle className="relative z-10 mt-5 text-2xl font-extrabold tracking-tight text-white">
                    Share your feedback
                  </DialogTitle>
                </div>

                <div className="px-6 pb-6 pt-1 sm:px-8">
                <DialogDescription className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                  Send an anonymous suggestion to help improve the EUB 39B app.
                </DialogDescription>

                <label htmlFor="feedback-message" className="sr-only">Your feedback</label>
                <textarea
                  id="feedback-message"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="What would you like to suggest?"
                  rows={5}
                  maxLength={2000}
                  disabled={feedbackSending}
                  className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-purple-400 dark:focus:ring-purple-400/25"
                />
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFeedbackModalOpen(false)}
                    disabled={feedbackSending}
                    className="h-11 rounded-xl border-slate-200 bg-transparent px-5 text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!feedback.trim() || feedbackSending}
                    className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30 disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:via-slate-700 dark:disabled:to-slate-700"
                  >
                    {feedbackSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {feedbackSending ? "Sending..." : "Submit"}
                  </Button>
                </div>
                </div>
              </form>
            </div>
          </div>
        </DialogPortal>
      </Dialog>

      <Dialog open={aboutModalOpen} onOpenChange={setAboutModalOpen}>
        <DialogPortal>
          <div
            aria-hidden
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xl"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2">
            <div className="about-glass-modal relative overflow-hidden rounded-[2rem] border border-white/30 shadow-2xl dark:border-white/10">
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-[#123c8c] via-[#1769aa] to-[#18a999]" />
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[18px] border-white/15" />
              <div className="absolute left-8 top-24 h-24 w-24 rounded-full bg-cyan-300/15 blur-2xl" />
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Close About dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative px-6 pb-6 pt-7 sm:px-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/35 bg-white/20 text-white shadow-lg backdrop-blur-md">
                  <Sparkles className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <DialogTitle className="about-gradient-title mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  EUB 39B
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Class Management App
                </DialogDescription>
                <p className="mt-3 inline-flex animate-pulse bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-xs font-bold tracking-wide text-transparent">
                  Exclusively crafted for EUB 39B Batch
                </p>

                <div className="about-glass-panel mt-6 overflow-hidden rounded-2xl border border-white/50 dark:border-white/10">
                  <div className="px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Developer</p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Developed and Maintained by{" "}
                      <a
                        href="https://www.facebook.com/share/yourujjal/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-teal-500 hover:decoration-teal-500 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:text-teal-300 dark:hover:text-teal-200 dark:hover:decoration-teal-200"
                      >
                        Ujjal Mallik
                      </a>
                    </p>
                  </div>
                  <div className="border-t border-white/50 px-4 py-4 dark:border-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">CURRENT INSTALLED VERSION</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">v{appVersion}</p>
                      </div>
                      <a
                        href="https://github.com/UjjalMallik/Class-Management-"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        GitHub
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="mt-4 border-t border-white/40 pt-4 dark:border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">LATEST AVAILABLE VERSION</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {latestRelease ? `v${normalizeVersion(latestRelease.tag_name)}` : updateStatus === "checking" ? "Checking..." : "Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {updateStatus === "update-available" && latestRelease && (
                  <button
                    type="button"
                    onClick={startApkDownload}
                    disabled={downloadStarting}
                    className="update-pulse mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-cyan-300/50 bg-cyan-500 px-4 py-3.5 text-left text-white shadow-lg shadow-cyan-500/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-wait disabled:opacity-80"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold">
                      <Download className={`h-4 w-4 ${downloadStarting ? "animate-bounce" : ""}`} />
                      {downloadStarting ? "Starting Download..." : "Download & Update Now"}
                    </span>
                    <span className="text-xs font-semibold text-cyan-50">v{normalizeVersion(latestRelease.tag_name)}</span>
                  </button>
                )}

                {updateStatus === "checking" && (
                  <div
                    className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-300/60 bg-white/35 px-4 py-3.5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-500" />
                    <span className="text-sm font-semibold">Checking for updates...</span>
                  </div>
                )}

                {updateStatus === "up-to-date" && !latestRelease && (
                  <div
                    className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3.5 text-emerald-800 shadow-sm dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 dark:bg-emerald-400/15">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    </span>
                    <span className="text-sm font-semibold">You are on the latest version</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  )
}
