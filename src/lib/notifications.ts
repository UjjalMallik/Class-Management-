import { getSupabase } from "@/lib/supabase"

interface NotificationPayload {
  title: string
  body: string
  type: "routine" | "note" | "class_link" | "notice"
}

export async function registerPushToken(token: string) {
  try {
    const { data, error } = await getSupabase().functions.invoke("register-push-token", {
      body: { token, platform: "android" },
    })

    if (error) {
      console.error("Push token registration failed:", error, { data })
      return
    }

    console.info("Push token registered:", data)
  } catch (error) {
    console.error("Push token registration request failed:", error)
  }
}

export async function notifyNewContent(payload: NotificationPayload) {
  try {
    const { data, error } = await getSupabase().functions.invoke("send-push", {
      body: payload,
    })

    if (error) {
      console.error("Push notification failed:", error, { payload, data })
      return
    }

    console.info("Push notification sent:", data)
  } catch (error) {
    console.error("Push notification request failed:", error, payload)
  }
}