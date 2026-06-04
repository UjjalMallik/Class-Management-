"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void
  children: React.ReactNode
  threshold?: number
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const startYRef = useRef<number | null>(null)
  const isPullingRef = useRef<boolean>(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (refreshing) return
      if (window.scrollY > 5) {
        startYRef.current = null
        return
      }
      startYRef.current = e.touches[0].clientY
      isPullingRef.current = false
    }

    function handleTouchMove(e: TouchEvent) {
      if (refreshing) return
      if (startYRef.current === null) return
      if (window.scrollY > 5) {
        startYRef.current = null
        isPullingRef.current = false
        setPullDistance(0)
        return
      }
      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current
      if (diff > 10) {
        isPullingRef.current = true
        e.preventDefault()
        const distance = Math.min(diff * 0.4, threshold * 1.5)
        setPullDistance(distance)
      }
    }

    async function handleTouchEnd() {
      if (refreshing) return
      if (startYRef.current === null) return
      const distance = pullDistance
      startYRef.current = null
      isPullingRef.current = false

      if (distance >= threshold) {
        setRefreshing(true)
        setPullDistance(threshold)
        const minDisplay = 600
        const start = Date.now()
        try {
          if (onRefresh) {
            await onRefresh()
          } else {
            window.location.reload()
            return
          }
        } finally {
          const elapsed = Date.now() - start
          if (elapsed < minDisplay) {
            await new Promise((r) => setTimeout(r, minDisplay - elapsed))
          }
          setRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [refreshing, pullDistance, onRefresh, threshold])

  const showIndicator = pullDistance > 0 || refreshing
  const rotation = (pullDistance / threshold) * 360

  return (
    <div className="relative">
      {showIndicator && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 flex items-center justify-center overflow-hidden"
          style={{
            top: 0,
            height: `${Math.min(pullDistance, threshold)}px`,
            transition:
              refreshing || pullDistance === 0
                ? "height 0.3s ease"
                : "none",
          }}
        >
          <RefreshCw
            className={`h-5 w-5 text-[#1e3a8a] dark:text-[#14b8a6] ${
              refreshing ? "animate-spin" : ""
            }`}
            style={{
              opacity: Math.min(pullDistance / 30, 1),
              transform: refreshing ? "none" : `rotate(${rotation}deg)`,
              transition: refreshing ? "none" : "transform 0.1s linear",
            }}
          />
        </div>
      )}
      <div
        style={{
          transform: refreshing
            ? `translateY(${threshold}px)`
            : `translateY(${pullDistance}px)`,
          transition:
            refreshing || pullDistance === 0
              ? "transform 0.3s ease"
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
