import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" }

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders })
  }

  try {
    const { token, platform } = await request.json() as { token?: string; platform?: string }
    if (!token || token.length > 4096) {
      return new Response(JSON.stringify({ error: "A valid push token is required" }), { status: 400, headers: jsonHeaders })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )
    const { error } = await supabase.from("push_tokens").upsert(
      {
        token,
        platform: platform || "android",
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    )
    if (error) throw error

    return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders })
  } catch (error) {
    console.error("Push token registration failed:", error)
    return new Response(JSON.stringify({ error: "Could not register push token" }), { status: 500, headers: jsonHeaders })
  }
})