import { getSupabase } from "@/lib/supabase"

interface NotificationPayload {
  title: string
  body: string
  type: "routine" | "note" | "class_link" | "notice"
}

export async function registerPushToken(token: string) {
  const { error } = await getSupabase().functions.invoke("register-push-token", {
    body: { token, platform: "android" },
  })

  if (error) {
    console.error("Push token registration failed:", error)
  }
}

export async function notifyNewContent(payload: NotificationPayload) {
  const { error } = await getSupabase().functions.invoke("send-push", {
    body: payload,
  })

  if (error) {
    console.error("Push notification failed:", error)
  }
}