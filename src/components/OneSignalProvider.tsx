"use client"

import { useEffect } from "react"
import OneSignal from "react-onesignal"

export default function OneSignalProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      })
    }
  }, [])

  return null
}
