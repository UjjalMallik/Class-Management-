import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: "color-mix(in oklab, var(--bg) 78%, transparent)" }}
    >
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="absolute h-24 w-24 rounded-full opacity-60 animate-ping"
          style={{ backgroundColor: "color-mix(in oklab, var(--accent) 18%, transparent)" }}
        />
        <span
          aria-hidden
          className="absolute h-20 w-20 rounded-full opacity-80 animate-pulse"
          style={{ backgroundColor: "color-mix(in oklab, var(--accent) 10%, transparent)" }}
        />

        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full border shadow-xl"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow:
              "0 10px 30px -10px color-mix(in oklab, var(--accent) 35%, transparent), 0 2px 6px -2px rgba(0,0,0,0.08)",
          }}
        >
          <Loader2
            className="h-7 w-7 animate-spin"
            style={{ color: "var(--accent)" }}
            strokeWidth={2.25}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1.5">
        <p
          className="text-sm font-medium tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          Loading
          <span className="inline-flex w-6 justify-start">
            <span className="animate-[dot_1.2s_steps(4,end)_infinite]">.</span>
            <span className="animate-[dot_1.2s_steps(4,end)_infinite] [animation-delay:0.15s]">.</span>
            <span className="animate-[dot_1.2s_steps(4,end)_infinite] [animation-delay:0.3s]">.</span>
          </span>
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Please wait a moment
        </p>
      </div>

      <span className="sr-only">Loading, please wait</span>
    </div>
  )
}
