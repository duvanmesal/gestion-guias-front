"use client"

import type { ReactNode } from "react"

interface GlassTableProps {
  children: ReactNode
  className?: string
}

export function GlassTable({ children, className = "" }: GlassTableProps) {
  return (
    <div className={`glass overflow-hidden ${className}`}>
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
  return <thead className="bg-white/10">{children}</thead>
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
      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${clickableClass} ${className}`}
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
    <th className={`px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--color-fg))] ${className}`}>{children}</th>
  )
}

interface GlassTableCellProps {
  children: ReactNode
  className?: string
}

export function GlassTableCell({ children, className = "" }: GlassTableCellProps) {
  return <td className={`px-4 py-3 text-sm text-[rgb(var(--color-fg)/0.8)] ${className}`}>{children}</td>
}
