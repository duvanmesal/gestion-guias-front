import { type InputHTMLAttributes, forwardRef } from "react"

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">{label}</label>}
        <div className="glass p-2 hover:bg-white/10 transition-colors">
          <input
            ref={ref}
            className={`bg-transparent w-full text-[rgb(var(--color-fg))] placeholder-white/50 focus-ring border-none outline-none ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-[rgb(var(--color-fg)/0.6)]">{helperText}</p>}
      </div>
    )
  },
)

GlassInput.displayName = "GlassInput"
