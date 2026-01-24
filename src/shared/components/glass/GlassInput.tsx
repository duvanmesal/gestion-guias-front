'use client';

import type React from "react"
import { type InputHTMLAttributes, forwardRef, useState } from "react"

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, leftIcon, className = "", ...props }, ref) => {
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
            className={`glass rounded-xl px-4 py-3 transition-all duration-200 ${
              isFocused ? "glass-input-focused" : ""
            } ${error ? "border-[rgb(var(--color-danger))] border-2" : ""}`}
          >
            {leftIcon && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))]">
                {leftIcon}
              </span>
            )}
            <input
              ref={ref}
              className={`bg-transparent w-full text-[rgb(var(--color-fg))] focus-ring border-none outline-none placeholder:text-[rgb(var(--color-muted)/0.6)] ${
                label ? "pt-4" : ""
              } ${leftIcon ? "pl-7" : ""} ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
            {label && (
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                  leftIcon ? "left-11" : ""
                } ${
                  isFocused || hasValue || props.value
                    ? "top-2 text-xs text-[rgb(var(--color-primary))]"
                    : "top-1/2 -translate-y-1/2 text-sm text-[rgb(var(--color-muted))]"
                }`}
              >
                {label}
              </label>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-[rgb(var(--color-danger))] font-medium animate-fade-in-up">
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

GlassInput.displayName = "GlassInput"
