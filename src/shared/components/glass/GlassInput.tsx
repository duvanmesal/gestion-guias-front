'use client'

import type React from "react"
import { type InputHTMLAttributes, forwardRef, useState, useEffect, useRef, useCallback } from "react"

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
}

function hasNonEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return false
  return String(v).trim().length > 0
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, leftIcon, className = "", placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasInternalValue, setHasInternalValue] = useState(() =>
      hasNonEmptyValue(props.value) || hasNonEmptyValue(props.defaultValue)
    )
    const inputRef = useRef<HTMLInputElement>(null)

    const setRefs = useCallback((node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }, [ref])

    useEffect(() => {
      if (props.value !== undefined) setHasInternalValue(hasNonEmptyValue(props.value))
    }, [props.value])

    useEffect(() => {
      const input = inputRef.current
      if (!input) return
      const check = () => { if (input.value?.length > 0) setHasInternalValue(true) }
      check()
      const onAnim = (e: AnimationEvent) => { if (e.animationName === 'onAutoFillStart') setHasInternalValue(true) }
      input.addEventListener('animationstart', onAnim)
      input.addEventListener('input', check)
      const t = setTimeout(check, 100)
      return () => { input.removeEventListener('animationstart', onAnim); input.removeEventListener('input', check); clearTimeout(t) }
    }, [])

    const shouldFloat = isFocused || hasNonEmptyValue(props.value) || hasInternalValue
    const showPlaceholder = !label || shouldFloat

    const borderColor = error
      ? "rgba(var(--color-danger), 0.5)"
      : isFocused
      ? "rgb(var(--color-primary))"
      : "rgba(var(--color-border), 0.12)"

    const boxShadow = error
      ? "0 0 0 3px rgba(var(--color-danger), 0.1)"
      : isFocused
      ? "0 0 0 3px rgba(var(--color-primary), 0.12)"
      : "none"

    return (
      <div className="w-full">
        <div className="relative">
          <div
            style={{
              background: error ? "rgba(var(--color-danger), 0.03)" : "rgb(var(--color-bg-elevated))",
              border: `1.5px solid ${borderColor}`,
              borderRadius: "var(--radius-md)",
              transition:
                "border-color 0.18s var(--ease-out-soft), box-shadow 0.18s var(--ease-out-soft), background-color 0.18s var(--ease-out-soft)",
              boxShadow,
              position: "relative",
            }}
          >
            {leftIcon && (
              <span
                className="absolute left-3.5 top-1/2"
                style={{
                  color: error
                    ? "rgb(var(--color-danger))"
                    : isFocused
                    ? "rgb(var(--color-primary))"
                    : "rgb(var(--color-muted))",
                  transform: isFocused ? "translateY(-50%) scale(1.08)" : "translateY(-50%) scale(1)",
                  transition: "color var(--motion-fast) var(--ease-out-soft), transform var(--motion-fast) var(--ease-out-soft)",
                }}
              >
                {leftIcon}
              </span>
            )}

            <input
              ref={setRefs}
              className={`w-full bg-transparent outline-none text-sm ${
                label ? "pt-5 pb-2" : "py-3"
              } ${leftIcon ? "pl-10" : "px-3.5"} pr-3.5 ${className}`}
              style={{ color: "rgb(var(--color-fg))" }}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false)
                setHasInternalValue(hasNonEmptyValue(e.target.value))
                props.onBlur?.(e)
              }}
              onChange={(e) => {
                setHasInternalValue(hasNonEmptyValue(e.target.value))
                props.onChange?.(e)
              }}
              placeholder={showPlaceholder ? placeholder : undefined}
              {...props}
            />

            {label && (
              <label
                className="absolute pointer-events-none font-medium transition-all duration-150"
                style={{
                  left: leftIcon ? "2.5rem" : "0.875rem",
                  top: shouldFloat ? "0.375rem" : "50%",
                  transform: shouldFloat ? "none" : "translateY(-50%)",
                  fontSize: shouldFloat ? 11 : 14,
                  color: shouldFloat
                    ? (error ? "rgb(var(--color-danger))" : "rgb(var(--color-primary))")
                    : "rgb(var(--color-muted))",
                  fontWeight: shouldFloat ? 600 : 400,
                }}
              >
                {label}
              </label>
            )}
          </div>
        </div>

        {error && (
          <p
            className="mt-1.5 text-xs font-medium flex items-center gap-1 motion-error"
            style={{ color: "rgb(var(--color-danger))" }}
          >
            <svg className="motion-pop w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs" style={{ color: "rgb(var(--color-muted))" }}>{helperText}</p>
        )}
      </div>
    )
  }
)

GlassInput.displayName = "GlassInput"
