import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Class Companion - CE",
  description: "Class Management for Civil Engineering",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script dangerouslySetInnerHTML={{ __html: `window.OneSignalDeferred = window.OneSignalDeferred || []; window.OneSignalDeferred.push(async function(OneSignal) { await OneSignal.init({ appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}" }); });` }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
