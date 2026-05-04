import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X, Clock } from "lucide-react"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const DIAS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]

function parseValue(value: string, type: "datetime-local" | "date"): Date | null {
  if (!value) return null
  const d = type === "datetime-local" ? new Date(value) : new Date(value + "T12:00:00")
  return isNaN(d.getTime()) ? null : d
}

function formatDisplay(value: string, type: "datetime-local" | "date"): string {
  const d = parseValue(value, type)
  if (!d) return ""
  const day = d.getDate()
  const mes = MESES[d.getMonth()].toLowerCase()
  const year = d.getFullYear()
  if (type === "date") return `${day} de ${mes} de ${year}`
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${day} de ${mes} de ${year}  ${hh}:${mm}`
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export interface GlassDateTimeInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  type?: "datetime-local" | "date"
  placeholder?: string
}

export function GlassDateTimeInput({
  value,
  onChange,
  label,
  error,
  disabled = false,
  type = "datetime-local",
  placeholder,
}: GlassDateTimeInputProps) {
  const [open, setOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const parsed = parseValue(value, type)

  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth())
  const [hours, setHours] = useState(parsed ? String(parsed.getHours()).padStart(2, "0") : "08")
  const [minutes, setMinutes] = useState(parsed ? String(parsed.getMinutes()).padStart(2, "0") : "00")

  useEffect(() => {
    const d = parseValue(value, type)
    if (d) {
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
      if (type === "datetime-local") {
        setHours(String(d.getHours()).padStart(2, "0"))
        setMinutes(String(d.getMinutes()).padStart(2, "0"))
      }
    }
  }, [value, type])

  const updatePos = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 288) })
  }, [])

  useEffect(() => {
    if (open) {
      updatePos()
      window.addEventListener("scroll", updatePos, true)
      window.addEventListener("resize", updatePos)
      return () => {
        window.removeEventListener("scroll", updatePos, true)
        window.removeEventListener("resize", updatePos)
      }
    }
  }, [open, updatePos])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedDay =
    parsed && parsed.getMonth() === viewMonth && parsed.getFullYear() === viewYear
      ? parsed.getDate()
      : null
  const todayDay =
    today.getMonth() === viewMonth && today.getFullYear() === viewYear ? today.getDate() : null

  const selectDay = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    if (type === "date") {
      onChange(dateStr)
      setOpen(false)
    } else {
      onChange(`${dateStr}T${hours}:${minutes}`)
    }
  }

  const commitTime = (h: string, m: string) => {
    const dateStr = value ? value.slice(0, 10) : toDateStr(viewYear, viewMonth, today.getDate())
    onChange(`${dateStr}T${h}:${m}`)
  }

  const handleHours = (v: string) => {
    const clamped = String(Math.max(0, Math.min(23, parseInt(v) || 0))).padStart(2, "0")
    setHours(clamped)
    if (value) commitTime(clamped, minutes)
  }

  const handleMinutes = (v: string) => {
    const clamped = String(Math.max(0, Math.min(59, parseInt(v) || 0))).padStart(2, "0")
    setMinutes(clamped)
    if (value) commitTime(hours, clamped)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  const goToday = () => {
    const t = new Date()
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
    const dateStr = toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
    onChange(type === "datetime-local" ? `${dateStr}T${hours}:${minutes}` : dateStr)
    if (type === "date") setOpen(false)
  }

  const displayValue = formatDisplay(value, type)
  const defaultPlaceholder = type === "datetime-local" ? "Seleccionar fecha y hora" : "Seleccionar fecha"

  const dropdown = open && dropdownPos ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
        background: "rgb(var(--color-bg-elevated))",
        border: "1px solid rgba(var(--color-border), 0.1)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
      }}
    >
      {/* Month nav */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "rgba(var(--color-border), 0.08)" }}
      >
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-[rgba(var(--color-primary),0.08)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: "rgb(var(--color-fg))" }} />
        </button>
        <span className="text-sm font-semibold" style={{ color: "rgb(var(--color-fg))" }}>
          {MESES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-[rgba(var(--color-primary),0.08)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" style={{ color: "rgb(var(--color-fg))" }} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DIAS.map((d) => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: "rgb(var(--color-muted))" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-3 pb-2 gap-y-0.5">
        {cells.map((day, i) =>
          day == null ? (
            <div key={`e-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onMouseDown={() => selectDay(day)}
              className="aspect-square flex items-center justify-center rounded-lg text-sm transition-colors hover:opacity-80"
              style={{
                background:
                  day === selectedDay
                    ? "rgb(var(--color-primary))"
                    : day === todayDay
                    ? "rgba(var(--color-primary), 0.12)"
                    : "transparent",
                color:
                  day === selectedDay
                    ? "#fff"
                    : day === todayDay
                    ? "rgb(var(--color-primary))"
                    : "rgb(var(--color-fg))",
                fontWeight: day === selectedDay || day === todayDay ? 600 : 400,
              }}
            >
              {day}
            </button>
          )
        )}
      </div>

      {/* Time picker */}
      {type === "datetime-local" && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-t"
          style={{ borderColor: "rgba(var(--color-border), 0.08)" }}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--color-muted))" }} />
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => handleHours(e.target.value)}
            className="w-10 text-center text-sm font-medium bg-transparent outline-none border rounded-lg px-1 py-0.5"
            style={{ color: "rgb(var(--color-fg))", borderColor: "rgba(var(--color-border), 0.2)" }}
          />
          <span className="text-sm font-medium" style={{ color: "rgb(var(--color-muted))" }}>:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => handleMinutes(e.target.value)}
            className="w-10 text-center text-sm font-medium bg-transparent outline-none border rounded-lg px-1 py-0.5"
            style={{ color: "rgb(var(--color-fg))", borderColor: "rgba(var(--color-border), 0.2)" }}
          />
        </div>
      )}

      {/* Footer */}
      <div
        className="flex justify-between items-center px-3 py-2 border-t"
        style={{ borderColor: "rgba(var(--color-border), 0.06)" }}
      >
        <button
          type="button"
          onMouseDown={() => { onChange(""); setOpen(false) }}
          className="text-xs px-2 py-1 rounded-lg transition-colors"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          Borrar
        </button>
        <button
          type="button"
          onMouseDown={goToday}
          className="text-xs px-2 py-1 rounded-lg font-medium transition-colors"
          style={{ color: "rgb(var(--color-primary))" }}
        >
          Hoy
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: "rgb(var(--color-fg))" }}>
          {label}
        </label>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => { if (!disabled) setOpen((o) => !o) }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!disabled) setOpen((o) => !o) }
          if (e.key === "Escape") setOpen(false)
        }}
        className={`glass flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-all duration-200 ${
          error ? "border-2 border-[rgb(var(--color-danger))]" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[rgb(var(--color-glass-hover)/0.5)]"} ${
          open ? "ring-2 ring-[rgb(var(--color-primary))/0.3]" : ""
        }`}
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <Calendar className="shrink-0 w-4 h-4" style={{ color: "rgb(var(--color-muted))" }} />
        <span
          className="flex-1 truncate text-sm font-medium"
          style={{ color: displayValue ? "rgb(var(--color-fg))" : "rgb(var(--color-muted))" }}
        >
          {displayValue || (placeholder ?? defaultPlaceholder)}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange("") }}
            className="shrink-0 p-0.5 rounded transition-colors"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" style={{ color: "rgb(var(--color-muted))" }} />
          </button>
        )}
        <ChevronDown
          className={`shrink-0 w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "rgb(var(--color-muted))" }}
        />
      </div>

      {typeof document !== "undefined" && dropdown ? createPortal(dropdown, document.body) : null}

      {error && (
        <p className="mt-2 text-sm font-medium" style={{ color: "rgb(var(--color-danger))" }}>{error}</p>
      )}
    </div>
  )
}
