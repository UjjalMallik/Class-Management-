import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message } = body;

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic os_v2_app_orssnxjnovh6jlgoustgjclzlc2xjfj3duvehrnmktxvbps3hlw2dfxvvsqqy7eiapo5nkxr2hx2n3synqb7bq5pdy2hq7yxccg7k6i"
      },
      body: JSON.stringify({
        app_id: "746526dd-2d75-4fe4-acce-a4a664897958",
        included_segments: ["All"], 
        headings: { en: title },
        contents: { en: message }
      })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error("Notification Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 });
  }
}
