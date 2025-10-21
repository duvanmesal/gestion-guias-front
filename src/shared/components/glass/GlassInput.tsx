import type React from "react"

import { type InputHTMLAttributes, forwardRef, useState } from "react"

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    return (
      <div className="w-full">
        <div className="relative glass-input-wrapper">
          <div
            className={`glass p-3 transition-all duration-300 ${isFocused ? "glass-input-focused" : ""} ${error ? "border-red-400/50" : ""}`}
          >
            <input
              ref={ref}
              className={`bg-transparent w-full text-[rgb(var(--color-fg))] focus-ring border-none outline-none pt-2 ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            {label && (
              <label
                className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                  isFocused || hasValue || props.value
                    ? "top-1 text-xs text-[rgb(var(--color-primary))]"
                    : "top-1/2 -translate-y-1/2 text-sm text-[rgb(var(--color-fg)/0.5)]"
                }`}
              >
                {label}
              </label>
            )}
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-400 animate-fade-in-up">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-[rgb(var(--color-fg)/0.6)]">{helperText}</p>}
      </div>
    )
  },
)

GlassInput.displayName = "GlassInput"
