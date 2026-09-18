import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendFirebaseNotification } from "../_shared/firebase.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" }
const allowedTypes = new Set(["routine", "note", "class_link", "notice"])

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders })
  }

  try {
    const { title, body, type } = await request.json() as {
      title?: string
      body?: string
      type?: string
    }
    if (!title || !body || !type || !allowedTypes.has(type)) {
      return new Response(JSON.stringify({ error: "title, body, and a valid type are required" }), { status: 400, headers: jsonHeaders })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )
    const { data, error } = await supabase.from("push_tokens").select("token")
    if (error) throw error

    console.info("Sending push notification:", {
      type,
      tokenCount: data?.length ?? 0,
    })

    const result = await sendFirebaseNotification(
      (data ?? []).map((row) => row.token as string),
      title.slice(0, 120),
      body.slice(0, 500),
      type,
    )
    console.info("Push notification result:", result)
    return new Response(JSON.stringify({ success: true, ...result }), { headers: jsonHeaders })
  } catch (error) {
    console.error("Push notification failed:", error)
    return new Response(JSON.stringify({ error: "Could not send push notification" }), { status: 500, headers: jsonHeaders })
  }
})