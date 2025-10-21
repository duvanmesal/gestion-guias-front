import { type SelectHTMLAttributes, forwardRef } from "react"
import { ChevronDown } from "lucide-react"

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, error, helperText, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-semibold text-[rgb(var(--color-fg))] mb-2.5">{label}</label>}
        <div className="glass-strong p-3 hover:bg-white/5 transition-all relative border border-white/10 rounded-xl group">
          <select
            ref={ref}
            className={`bg-transparent w-full text-[rgb(var(--color-fg))] focus-ring border-none outline-none appearance-none pr-8 font-medium ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-fg)/0.5)] pointer-events-none group-hover:text-[rgb(var(--color-primary))] transition-colors" />
        </div>
        {error && <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-[rgb(var(--color-fg)/0.6)]">{helperText}</p>}
      </div>
    )
  },
)

GlassSelect.displayName = "GlassSelect"
