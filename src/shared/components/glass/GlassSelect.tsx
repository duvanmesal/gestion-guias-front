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
        {label && (
          <label className="block text-sm font-semibold text-[rgb(var(--color-fg))] mb-2">
            {label}
          </label>
        )}
        <div
          className={`glass rounded-xl px-4 py-3 transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] relative group hover:bg-[rgb(var(--color-glass-hover)/0.5)] focus-within:border-[rgb(var(--color-primary))] focus-within:shadow-[0_0_0_3px_rgba(var(--color-primary),0.12)] ${
            error ? "border-[rgb(var(--color-danger))] border-2" : ""
          }`}
        >
          <select
            ref={ref}
            className={`bg-transparent w-full text-[rgb(var(--color-fg))] focus-ring border-none outline-none appearance-none pr-8 font-medium cursor-pointer ${className}`}
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-muted))] pointer-events-none group-hover:text-[rgb(var(--color-primary))] group-focus-within:text-[rgb(var(--color-primary))] group-focus-within:-translate-y-[40%] transition-[color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[rgb(var(--color-danger))] font-medium">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-[rgb(var(--color-muted))]">{helperText}</p>
        )}
      </div>
    )
  }
)

GlassSelect.displayName = "GlassSelect"
