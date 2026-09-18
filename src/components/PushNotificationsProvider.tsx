"use client"

import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"

export default function PushNotificationsProvider() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const setupPushNotifications = async () => {
      const currentPermissions = await PushNotifications.checkPermissions()
      let receivePermission = currentPermissions.receive

      if (receivePermission === "prompt") {
        receivePermission = (await PushNotifications.requestPermissions()).receive
      }

      if (receivePermission !== "granted") return

      await PushNotifications.register()
    }

    const listeners = Promise.all([
      PushNotifications.addListener("registration", (token) => {
        console.info("Push registration token:", token.value)
      }),
      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration error:", error)
      }),
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.info("Push notification received:", notification)
      }),
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.info("Push notification action:", action)
      }),
    ])

    void setupPushNotifications()

    return () => {
      void listeners.then((handles) => {
        handles.forEach((handle) => void handle.remove())
      })
    }
  }, [])

  return null
}