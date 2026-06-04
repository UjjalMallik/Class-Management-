import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { title, message } = await request.json()

  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users", "Total Subscriptions"],
      headings: { en: title },
      contents: { en: message },
    }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
