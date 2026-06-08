import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
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
  searchable?: boolean
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
  searchable = true,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [reduce, setReduce] = useState(false)
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState(0)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = options.find((o) => o.value === value) ?? null
  const filtered = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => { setHighlighted(0) }, [query])

  const updatePos = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(mq.matches)
    const h = () => setReduce(mq.matches)
    mq.addEventListener?.("change", h)
    return () => mq.removeEventListener?.("change", h)
  }, [])

  const DURATION = reduce ? 0 : 180

  const openCombo = useCallback(() => {
    if (disabled) return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    updatePos()
    setMounted(true)
    setOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
  }, [disabled, updatePos])

  const closeCombo = useCallback(() => {
    setShown(false)
    setOpen(false)
    setQuery("")
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMounted(false), DURATION)
  }, [DURATION])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

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
        closeCombo()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus()
  }, [open, searchable])

  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[highlighted] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [highlighted])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        openCombo()
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
      if (filtered[highlighted]) select(filtered[highlighted].value)
    } else if (e.key === "Escape") {
      closeCombo()
    }
  }

  const select = (val: string) => {
    onChange(val)
    closeCombo()
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const dropdown = mounted && dropdownPos ? (
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
        boxShadow: "var(--shadow-floating), var(--glass-inner-highlight)",
        overflow: "hidden",
        transformOrigin: "top",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
        transition: `opacity ${DURATION}ms ${shown ? "var(--ease-out-soft)" : "ease-in"}, transform ${DURATION}ms ${shown ? "var(--ease-out-soft)" : "ease-in"}`,
        willChange: "transform, opacity",
      }}
    >
      {searchable && (
        <div
          className="group flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: "rgba(var(--color-border), 0.08)" }}
        >
          <Search className="motion-icon shrink-0 w-4 h-4 text-[rgb(var(--color-muted))] group-focus-within:text-[rgb(var(--color-primary))]" />
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
      )}

      <ul ref={listRef} role="listbox" className="overflow-y-auto" style={{ maxHeight: "240px" }}>
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-center" style={{ color: "rgb(var(--color-muted))" }}>
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
                className="px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between gap-2"
                style={{
                  background: isHighlighted
                    ? "rgba(var(--color-primary), 0.08)"
                    : isSelected
                    ? "rgba(var(--color-primary), 0.05)"
                    : "transparent",
                  color: isSelected ? "rgb(var(--color-primary))" : "rgb(var(--color-fg))",
                  fontWeight: isSelected ? 600 : 400,
                  transform: isHighlighted ? "translateX(3px)" : "translateX(0)",
                  boxShadow: isHighlighted ? "inset 2px 0 0 rgb(var(--color-primary))" : "none",
                  transition: "background-color var(--motion-fast) var(--ease-out-soft), color var(--motion-fast) var(--ease-out-soft), transform var(--motion-fast) var(--ease-out-soft), box-shadow var(--motion-fast) var(--ease-out-soft)",
                }}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg className="motion-pop shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            )
          })
        )}
      </ul>
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
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => { if (!disabled) (open ? closeCombo() : openCombo()) }}
        className={`glass flex items-center gap-2 px-4 py-3 cursor-pointer select-none transition-all duration-200 ${
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

      {typeof document !== "undefined" && dropdown ? createPortal(dropdown, document.body) : null}

      {error && (
        <p className="mt-2 text-sm font-medium" style={{ color: "rgb(var(--color-danger))" }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm" style={{ color: "rgb(var(--color-muted))" }}>{helperText}</p>
      )}
    </div>
  )
}
