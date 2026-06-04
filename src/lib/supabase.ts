import { createClient, SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

function disableClientCache() {
  if (typeof window === "undefined") return
  const w = window as unknown as { fetch: typeof fetch }
  if ((w.fetch as unknown as { __noStorePatched?: boolean }).__noStorePatched) return
  const originalFetch = w.fetch.bind(window)
  w.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    return originalFetch(input, { cache: "no-store", ...init })
  }) as typeof fetch
  ;(w.fetch as unknown as { __noStorePatched?: boolean }).__noStorePatched = true
}

export function getSupabase(): SupabaseClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }

  disableClientCache()

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
      fetch: ((input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { cache: "no-store", ...init })) as typeof fetch,
    },
  })
  return client
}
