"use client"

import { useEffect } from "react"

export default function VisibilityReload() {
  useEffect(() => {
    let hasBeenHidden = false

    function handleVisibilityChange() {
      if (typeof document === "undefined") return
      if (document.visibilityState === "hidden") {
        hasBeenHidden = true
      } else if (document.visibilityState === "visible" && hasBeenHidden) {
        hasBeenHidden = false
        window.location.reload()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return null
}
