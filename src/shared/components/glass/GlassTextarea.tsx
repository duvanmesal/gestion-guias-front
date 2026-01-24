'use client';

import { type TextareaHTMLAttributes, forwardRef, useState } from "react"

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[rgb(var(--color-fg))] mb-2">
            {label}
          </label>
        )}
        <div
          className={`glass rounded-xl px-4 py-3 transition-all duration-200 ${
            isFocused ? "glass-input-focused" : ""
          } ${error ? "border-[rgb(var(--color-danger))] border-2" : ""}`}
        >
          <textarea
            ref={ref}
            className={`bg-transparent w-full text-[rgb(var(--color-fg))] placeholder:text-[rgb(var(--color-muted)/0.6)] focus-ring border-none outline-none resize-none min-h-[100px] ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
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

GlassTextarea.displayName = "GlassTextarea"
