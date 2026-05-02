import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import {
  KeyRound, Lock, ArrowLeft, ShieldCheck, Eye, EyeOff,
  CheckCircle, Circle, AlertCircle,
} from "lucide-react"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { authApi } from "@/core/api"

const rules = {
  minLength:   { label: "Mínimo 8 caracteres",               test: (p: string) => p.length >= 8 },
  hasUpper:    { label: "Al menos una letra mayúscula",       test: (p: string) => /[A-Z]/.test(p) },
  hasLower:    { label: "Al menos una letra minúscula",       test: (p: string) => /[a-z]/.test(p) },
  hasNumber:   { label: "Al menos un número",                 test: (p: string) => /[0-9]/.test(p) },
  hasSpecial:  { label: "Un carácter especial (!@#$…)",       test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
}

function RuleRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-[12px] ${met ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-muted))]"}`}>
      {met
        ? <CheckCircle className="w-[14px] h-[14px] shrink-0" />
        : <Circle className="w-[14px] h-[14px] shrink-0" />}
      {label}
    </div>
  )
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validation = Object.fromEntries(
    Object.entries(rules).map(([k, r]) => [k, r.test(newPassword)])
  ) as Record<keyof typeof rules, boolean>

  const metCount = Object.values(validation).filter(Boolean).length
  const isPasswordValid = Object.values(validation).every(Boolean)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    if (!token) setError("Enlace inválido. No se encontró el token de recuperación.")
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !isPasswordValid || !passwordsMatch) return
    setError(null)
    setIsLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword })
      setIsSuccess(true)
    } catch {
      setError("Token inválido o expirado. Por favor, solicita un nuevo enlace.")
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Invalid token state ── */
  if (!token && !isSuccess) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[rgb(var(--color-bg))] px-6">
        <div
          className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6"
          style={{ background: "rgba(185,55,55,0.12)", border: "1px solid rgba(185,55,55,0.25)" }}
        >
          <AlertCircle className="w-11 h-11 text-[rgb(var(--color-danger))]" />
        </div>
        <h2 className="text-xl font-bold text-[rgb(var(--color-fg))] mb-2">Enlace Inválido</h2>
        <p className="text-sm text-[rgb(var(--color-muted))] text-center mb-8 leading-relaxed">
          El enlace de recuperación no es válido o ha expirado.
        </p>
        <Link
          to="/forgot-password"
          className="w-full max-w-sm h-[56px] rounded-2xl flex items-center justify-center gap-2 text-white text-[16px] font-bold"
          style={{ background: "linear-gradient(180deg, #22C55E 0%, #15803D 100%)", boxShadow: "0 6px 20px rgba(34,197,94,0.4)" }}
        >
          Solicitar Nuevo Enlace
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[rgb(var(--color-bg))] relative overflow-hidden">
      {/* Top glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)" }}
      />

      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-6 py-10 sm:py-14 relative z-10">

        {/* Back button */}
        <div className="flex items-center gap-2.5 mb-10">
          <Link
            to="/login"
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgb(var(--color-glass))", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <ArrowLeft className="w-[18px] h-[18px] text-[rgb(var(--color-fg))]" />
          </Link>
          <span className="text-sm font-semibold text-[rgb(var(--color-muted))]">Volver</span>
        </div>

        {isSuccess ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-6 mt-4">
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)", boxShadow: "0 12px 32px rgba(34,197,94,0.45)" }}
            >
              <ShieldCheck className="w-11 h-11 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[rgb(var(--color-fg))]">¡Contraseña Actualizada!</h1>
              <p className="mt-3 text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                Tu contraseña ha sido restablecida. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[56px] rounded-2xl flex items-center justify-center gap-2 text-white text-[16px] font-bold"
              style={{ background: "linear-gradient(180deg, #22C55E 0%, #15803D 100%)", boxShadow: "0 6px 20px rgba(34,197,94,0.4)" }}
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Illustration + heading */}
            <div className="flex flex-col items-center text-center gap-5 mb-8">
              <div
                className="w-24 h-24 rounded-[28px] flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)", boxShadow: "0 12px 32px rgba(34,197,94,0.45)" }}
              >
                <KeyRound className="w-11 h-11 text-white" />
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold leading-tight text-[rgb(var(--color-fg))]">
                  Nueva contraseña
                </h1>
                <p className="mt-2 text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                  Crea una contraseña segura de al menos 8 caracteres.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--color-danger)/0.3)] bg-[rgb(var(--color-danger)/0.08)] animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 text-[rgb(var(--color-danger))] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[rgb(var(--color-danger))]">{error}</p>
                    <Link to="/forgot-password" className="text-xs text-[rgb(var(--color-danger))] underline mt-0.5 inline-block">
                      Solicitar nuevo enlace
                    </Link>
                  </div>
                </div>
              )}

              {/* New password */}
              <div className="relative">
                <GlassInput
                  label="Nueva contraseña"
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-[18px] h-[18px] text-[rgb(var(--color-primary))]" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors"
                >
                  {showNew ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-colors duration-300"
                      style={{ background: i < metCount ? "rgb(var(--color-primary))" : "rgb(var(--color-glass))" }}
                    />
                  ))}
                </div>
              )}

              {/* Confirm password */}
              <div className="relative">
                <GlassInput
                  label="Confirmar contraseña"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-[18px] h-[18px] text-[rgb(var(--color-primary))]" />}
                  error={confirmPassword.length > 0 && !passwordsMatch ? "Las contraseñas no coinciden" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Rules box */}
              <div
                className="rounded-xl px-4 py-3.5 flex flex-col gap-2"
                style={{ background: "rgb(var(--color-glass))", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                {Object.entries(rules).map(([k, r]) => (
                  <RuleRow key={k} met={validation[k as keyof typeof rules]} label={r.label} />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                className="mt-2 w-full h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(180deg, #22C55E 0%, #15803D 100%)", boxShadow: "0 6px 20px rgba(34,197,94,0.4)" }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Actualizar contraseña
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
