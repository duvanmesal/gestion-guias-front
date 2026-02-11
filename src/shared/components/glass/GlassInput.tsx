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
  const s = String(v)
  return s.trim().length > 0
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, leftIcon, className = "", placeholder, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    // Estado interno para rastrear si el input tiene contenido (para inputs no controlados)
    const [hasInternalValue, setHasInternalValue] = useState(() => 
      hasNonEmptyValue(props.value) || hasNonEmptyValue(props.defaultValue)
    )
    const inputRef = useRef<HTMLInputElement>(null)

    // Combinar refs para poder acceder internamente y pasar al padre
    const setRefs = useCallback((node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])

    // Sincronizar estado cuando cambia value controlado
    useEffect(() => {
      if (props.value !== undefined) {
        setHasInternalValue(hasNonEmptyValue(props.value))
      }
    }, [props.value])

    // Detectar autofill del navegador
    useEffect(() => {
      const input = inputRef.current
      if (!input) return

      // Verificar inmediatamente por si ya tiene valor
      const checkValue = () => {
        if (input.value && input.value.length > 0) {
          setHasInternalValue(true)
        }
      }
      
      checkValue()

      // Detectar autofill via animationstart (técnica estándar)
      const handleAnimationStart = (e: AnimationEvent) => {
        if (e.animationName === 'onAutoFillStart') {
          setHasInternalValue(true)
        }
      }

      // También verificar en input event por si acaso
      const handleInput = () => checkValue()

      input.addEventListener('animationstart', handleAnimationStart)
      input.addEventListener('input', handleInput)

      // Pequeño delay para capturar autofill inicial del navegador
      const timeoutId = setTimeout(checkValue, 100)

      return () => {
        input.removeEventListener('animationstart', handleAnimationStart)
        input.removeEventListener('input', handleInput)
        clearTimeout(timeoutId)
      }
    }, [])

    // El label flota si: hay focus, tiene valor controlado, o tiene valor interno
    const shouldFloat = isFocused || hasNonEmptyValue(props.value) || hasInternalValue

    // El placeholder solo se muestra cuando:
    // 1. No hay label (comportamiento normal)
    // 2. O hay label Y el label ya esta flotando (para evitar superposicion)
    // Esto evita que placeholder y label compitan visualmente
    const showPlaceholder = !label || shouldFloat

    const handleFocus = () => setIsFocused(true)
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      // Actualizar estado interno basado en el valor actual del input
      setHasInternalValue(hasNonEmptyValue(e.target.value))
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Actualizar estado interno para inputs no controlados
      setHasInternalValue(hasNonEmptyValue(e.target.value))
      props.onChange?.(e)
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
              ref={setRefs}
              className={`bg-transparent w-full text-[rgb(var(--color-fg))] focus-ring border-none outline-none placeholder:text-[rgb(var(--color-muted)/0.6)] ${
                label ? "pt-4" : ""
              } ${leftIcon ? "pl-7" : ""} ${className}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder={showPlaceholder ? placeholder : undefined}
              {...props}
            />

            {label && (
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                  leftIcon ? "left-11" : ""
                } ${
                  shouldFloat
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
