import { type TextareaHTMLAttributes, forwardRef } from "react"

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-semibold text-[rgb(var(--color-fg))] mb-2.5">{label}</label>}
        <div className="glass-strong p-3 hover:bg-white/5 transition-all border border-white/10 rounded-xl">
          <textarea
            ref={ref}
            className={`bg-transparent w-full text-[rgb(var(--color-fg))] placeholder-[rgb(var(--color-fg)/0.4)] focus-ring border-none outline-none resize-none font-medium ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-[rgb(var(--color-fg)/0.6)]">{helperText}</p>}
      </div>
    )
  },
)

GlassTextarea.displayName = "GlassTextarea"
