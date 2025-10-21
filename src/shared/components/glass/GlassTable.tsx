"use client"

import type { ReactNode } from "react"

interface GlassTableProps {
  children: ReactNode
  className?: string
}

export function GlassTable({ children, className = "" }: GlassTableProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  )
}

interface GlassTableHeaderProps {
  children: ReactNode
}

export function GlassTableHeader({ children }: GlassTableHeaderProps) {
  return <thead className="glass-strong border-b border-white/10">{children}</thead>
}

interface GlassTableBodyProps {
  children: ReactNode
}

export function GlassTableBody({ children }: GlassTableBodyProps) {
  return <tbody>{children}</tbody>
}

interface GlassTableRowProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function GlassTableRow({ children, onClick, className = "" }: GlassTableRowProps) {
  const clickableClass = onClick ? "cursor-pointer" : ""

  return (
    <tr
      className={`border-b border-white/5 hover:bg-white/5 transition-all ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface GlassTableHeadProps {
  children: ReactNode
  className?: string
}

export function GlassTableHead({ children, className = "" }: GlassTableHeadProps) {
  return (
    <th
      className={`px-5 py-4 text-left text-xs font-bold text-[rgb(var(--color-fg))] uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  )
}

interface GlassTableCellProps {
  children: ReactNode
  className?: string
}

export function GlassTableCell({ children, className = "" }: GlassTableCellProps) {
  return <td className={`px-5 py-4 text-sm text-[rgb(var(--color-fg)/0.9)] ${className}`}>{children}</td>
}
