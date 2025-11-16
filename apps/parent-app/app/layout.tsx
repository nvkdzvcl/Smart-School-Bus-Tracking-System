import type React from "react"
import { Outlet } from "react-router-dom"

// import type { Metadata } from "next"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

// export const metadata: Metadata = {
//   title: "SSB Parent - School Bus Tracking",
//   description: "Track your child's school bus in real-time",
//   generator: "v0.app",
// }

export default function RootLayout() {
    const bodyClassName = "dark font-sans"
  return (
    <div lang="vi" className={bodyClassName}>
      <Suspense fallback={null}>
          <Outlet />
      </Suspense>
    </div>
  )
}
