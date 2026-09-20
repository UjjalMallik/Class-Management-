interface NotificationPayload {
  title: string
  body: string
  type: "routine" | "note" | "class_link" | "notice"
}

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/+$/, "")

function getApiUrl(path: string) {
  if (!apiOrigin) throw new Error("NEXT_PUBLIC_API_ORIGIN is not configured")

  const url = new URL(path, `${apiOrigin}/`)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_ORIGIN must be an HTTP(S) URL")
  }
  return url.toString()
}

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({})) as { error?: string; sent?: number; failed?: number }
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`)
  return data
}

export async function registerPushToken(token: string) {
  const response = await fetch(getApiUrl("/api/register-push-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform: "android" }),
  })
  const data = await readApiResponse(response)
  console.info("Push token registered:", data)
}

export async function notifyNewContent(payload: NotificationPayload) {
  const response = await fetch(getApiUrl("/api/send-push"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": process.env.NEXT_PUBLIC_ADMIN_PIN || "",
    },
    body: JSON.stringify(payload),
  })
  const data = await readApiResponse(response)
  console.info("Push notification sent:", data)
  return data
}