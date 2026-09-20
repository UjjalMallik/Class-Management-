import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-pin",
}

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error("Supabase server environment variables are not configured")
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { token, platform } = await request.json() as { token?: string; platform?: string }
    if (!token || token.length > 4096) {
      return jsonResponse({ error: "A valid push token is required" }, 400)
    }

    const { error } = await getServerSupabase().from("push_tokens").upsert(
      { token, platform: platform || "android", last_seen_at: new Date().toISOString() },
      { onConflict: "token" },
    )
    if (error) throw error

    return jsonResponse({ success: true })
  } catch (error) {
    console.error("Push token registration failed:", error)
    return jsonResponse({ error: "Could not register push token" }, 500)
  }
}
