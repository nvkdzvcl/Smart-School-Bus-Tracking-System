import type React from "react"
import { ParentNav } from "@/components/parent-nav"

export default function ParentScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ParentNav />
    </>
  )
}
