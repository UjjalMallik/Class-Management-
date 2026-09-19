import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getFirebaseMessaging } from "@/lib/firebase-admin"

export const runtime = "nodejs"

const allowedTypes = new Set(["routine", "note", "class_link", "notice"])

type NotificationPayload = {
  title?: string
  body?: string
  type?: string
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error("Supabase server environment variables are not configured")
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

function isAdmin(request: Request) {
  const configuredPin = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN
  return Boolean(configuredPin && request.headers.get("x-admin-pin") === configuredPin)
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { title, body, type } = await request.json() as NotificationPayload
    if (!title || !body || !type || !allowedTypes.has(type)) {
      return NextResponse.json({ error: "title, body, and a valid type are required" }, { status: 400 })
    }

    const { data, error } = await getServerSupabase().from("push_tokens").select("token")
    if (error) throw error

    const tokens = (data ?? []).map((row) => row.token as string).filter(Boolean)
    if (tokens.length === 0) return NextResponse.json({ success: true, sent: 0, failed: 0 })

    let sent = 0
    let failed = 0
    for (let index = 0; index < tokens.length; index += 500) {
      const response = await getFirebaseMessaging().sendEachForMulticast({
        tokens: tokens.slice(index, index + 500),
        notification: { title: title.slice(0, 120), body: body.slice(0, 500) },
        data: { type },
        android: { notification: { channelId: "class-updates" } },
      })
      sent += response.successCount
      failed += response.failureCount
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
    })
  } catch (error) {
    console.error("Push notification failed:", error)
    return NextResponse.json({ error: "Could not send push notification" }, { status: 500 })
  }
}
