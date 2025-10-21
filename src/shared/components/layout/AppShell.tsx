"use client"

import { type ReactNode, useState } from "react"
import { Topbar } from "./Topbar"
import { Sidebar } from "./Sidebar"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-primary)/0.08)] via-transparent to-[rgb(var(--color-accent)/0.05)]">
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-6 md:ml-64 mt-16">{children}</main>
      </div>
    </div>
  )
}
