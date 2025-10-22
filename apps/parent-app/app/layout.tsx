import type React from "react"
// import type { Metadata } from "next"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

// export const metadata: Metadata = {
//   title: "SSB Parent - School Bus Tracking",
//   description: "Track your child's school bus in real-time",
//   generator: "v0.app",
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div lang="vi" className="dark font-sans">
      <Suspense fallback={null}>{children}</Suspense>
      {/* <Analytics /> */}
    </div>
  )
}
