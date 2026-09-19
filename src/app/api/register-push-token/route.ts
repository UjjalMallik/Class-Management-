import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error("Supabase server environment variables are not configured")
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const { token, platform } = await request.json() as { token?: string; platform?: string }
    if (!token || token.length > 4096) {
      return NextResponse.json({ error: "A valid push token is required" }, { status: 400 })
    }

    const { error } = await getServerSupabase().from("push_tokens").upsert(
      { token, platform: platform || "android", last_seen_at: new Date().toISOString() },
      { onConflict: "token" },
    )
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Push token registration failed:", error)
    return NextResponse.json({ error: "Could not register push token" }, { status: 500 })
  }
}
