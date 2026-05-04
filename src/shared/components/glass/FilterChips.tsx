import { X } from "lucide-react"

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

interface FilterChipsProps {
  chips: FilterChip[]
  onClearAll?: () => void
}

export function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={{
            background: "rgba(var(--color-primary), 0.1)",
            color: "rgb(var(--color-primary))",
            border: "1px solid rgba(var(--color-primary), 0.2)",
          }}
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full p-0.5 hover:bg-[rgba(var(--color-primary),0.15)] transition-colors"
            aria-label={`Quitar filtro ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {chips.length >= 2 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium transition-colors px-2 py-1 rounded-full hover:bg-[rgba(var(--color-border),0.06)]"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          Limpiar todo
        </button>
      )}
    </div>
  )
}
