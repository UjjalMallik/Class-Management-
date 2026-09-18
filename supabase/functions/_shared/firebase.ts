import { importPKCS8, SignJWT } from "npm:jose@6.1.3"

interface FirebaseServiceAccount {
  project_id: string
  client_email: string
  private_key: string
}

function getServiceAccount(): FirebaseServiceAccount {
  const value = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON")
  if (!value) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured")

  const account = JSON.parse(value) as FirebaseServiceAccount
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is incomplete")
  }
  return account
}

async function getAccessToken(account: FirebaseServiceAccount) {
  const privateKey = await importPKCS8(account.private_key.replace(/\\n/g, "\n"), "RS256")
  const now = Math.floor(Date.now() / 1000)
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(account.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })
  if (!response.ok) throw new Error(`Firebase OAuth failed: ${await response.text()}`)

  const token = await response.json() as { access_token?: string }
  if (!token.access_token) throw new Error("Firebase OAuth response did not include an access token")
  return token.access_token
}

export async function sendFirebaseNotification(
  tokens: string[],
  title: string,
  body: string,
  type: string,
) {
  if (tokens.length === 0) return { sent: 0, failed: 0 }

  const account = getServiceAccount()
  const accessToken = await getAccessToken(account)
  const results = await Promise.all(
    tokens.map(async (token) => {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
              data: { type },
            },
          }),
        },
      )
      if (!response.ok) {
        console.error("FCM rejected token:", {
          status: response.status,
          tokenSuffix: token.slice(-8),
          response: await response.text(),
        })
      }
      return { token, sent: response.ok }
    }),
  )

  return {
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
  }
}