"use client"

import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { registerPushToken } from "@/lib/notifications"
import { toast } from "sonner"

export default function PushNotificationsProvider() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const setupPushNotifications = async () => {
      if (Capacitor.getPlatform() === "android") {
        await PushNotifications.createChannel({
          id: "class-updates",
          name: "Class updates",
          description: "Notifications about new class content",
          importance: 4,
          visibility: 1,
        })
      }

      let receivePermission = (await PushNotifications.checkPermissions()).receive
      if (receivePermission !== "granted") {
        receivePermission = (await PushNotifications.requestPermissions()).receive
      }

      if (receivePermission !== "granted") {
        console.warn("Push notifications permission was not granted:", receivePermission)
        return
      }

      await PushNotifications.register()
    }

    const listeners = Promise.all([
      PushNotifications.addListener("registration", (token) => {
        console.info("Push registration token:", token.value)
        void registerPushToken(token.value)
          .catch((error) => {
            console.error("Push token backend registration failed:", error)
          })
      }),
      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration error:", error)
      }),
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.info("Push notification received:", notification)
        toast(notification.title || "New notification", {
          description: notification.body,
        })
      }),
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.info("Push notification action:", action)
      }),
    ])

    void setupPushNotifications().catch((error) => {
      console.error("Push notification setup failed:", error)
    })

    return () => {
      void listeners.then((handles) => {
        handles.forEach((handle) => void handle.remove())
      })
    }
  }, [])

  return null
}