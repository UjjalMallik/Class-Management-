interface NotificationPayload {
  title: string
  body: string
  type: "routine" | "note" | "class_link" | "notice"
}

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN

export async function registerPushToken(token: string) {
  try {
    const response = await fetch(`${apiOrigin}/api/register-push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: "android" }),
    })
    const data = await response.json()

    if (!response.ok) {
      console.error("Push token registration failed:", data)
      return
    }

    console.info("Push token registered:", data)
  } catch (error) {
    console.error("Push token registration request failed:", error)
  }
}

export async function notifyNewContent(payload: NotificationPayload) {
  try {
    const response = await fetch(`${apiOrigin}/api/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": process.env.NEXT_PUBLIC_ADMIN_PIN || "",
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (!response.ok) {
      console.error("Push notification failed:", data, { payload })
      return
    }

    console.info("Push notification sent:", data)
  } catch (error) {
    console.error("Push notification request failed:", error, payload)
  }
}