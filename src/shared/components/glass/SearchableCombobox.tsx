import { useEffect, useRef, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"

export interface ComboboxOption {
  value: string
  label: string
}

export interface SearchableComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  label,
  placeholder = "Seleccionar...",
  error,
  helperText,
  disabled = false,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [highlighted, setHighlighted] = useState(0)

  const selected = options.find((o) => o.value === value) ?? null

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlighted(0) }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[highlighted] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [highlighted])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filtered[highlighted]) {
        select(filtered[highlighted].value)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setQuery("")
    }
  }

  const select = (val: string) => {
    onChange(val)
    setOpen(false)
    setQuery("")
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold mb-2" style={{ color: "rgb(var(--color-fg))" }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => { if (!disabled) setOpen((o) => !o) }}
        className={`glass relative flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-all duration-200 ${
          error ? "border-2 border-[rgb(var(--color-danger))]" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[rgb(var(--color-glass-hover)/0.5)]"} ${
          open ? "ring-2 ring-[rgb(var(--color-primary))/0.3]" : ""
        }`}
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <span
          className="flex-1 truncate text-sm font-medium"
          style={{ color: selected ? "rgb(var(--color-fg))" : "rgb(var(--color-muted))" }}
        >
          {selected ? selected.label : placeholder}
        </span>

        {selected && selected.value !== "" && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 p-0.5 rounded hover:bg-[rgb(var(--color-border)/0.1)] transition-colors"
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

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl shadow-lg overflow-hidden"
          style={{
            background: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgba(var(--color-border), 0.1)",
            boxShadow: "var(--shadow-lg)",
            minWidth: containerRef.current?.offsetWidth,
            maxWidth: containerRef.current?.offsetWidth,
          }}
        >
          {/* Search input */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "rgba(var(--color-border), 0.08)" }}
          >
            <Search className="shrink-0 w-4 h-4" style={{ color: "rgb(var(--color-muted))" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "rgb(var(--color-fg))" }}
            />
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            className="overflow-y-auto"
            style={{ maxHeight: "240px" }}
          >
            {filtered.length === 0 ? (
              <li
                className="px-4 py-3 text-sm text-center"
                style={{ color: "rgb(var(--color-muted))" }}
              >
                Sin resultados
              </li>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value
                const isHighlighted = i === highlighted
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(i)}
                    onMouseDown={(e) => { e.preventDefault(); select(opt.value) }}
                    className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between gap-2 transition-colors"
                    style={{
                      background: isHighlighted
                        ? "rgba(var(--color-primary), 0.08)"
                        : isSelected
                        ? "rgba(var(--color-primary), 0.05)"
                        : "transparent",
                      color: isSelected
                        ? "rgb(var(--color-primary))"
                        : "rgb(var(--color-fg))",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg className="shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm font-medium" style={{ color: "rgb(var(--color-danger))" }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm" style={{ color: "rgb(var(--color-muted))" }}>{helperText}</p>
      )}
    </div>
  )
}
