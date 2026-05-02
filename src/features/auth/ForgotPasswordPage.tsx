import { useState } from "react"
import { Link } from "react-router-dom"
import { MailOpen, Mail, ArrowLeft, Send, LogIn, Info, CheckCircle } from "lucide-react"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { authApi } from "@/core/api"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValidEmail = email.includes("@") && email.includes(".")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setIsSubmitted(true)
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[rgb(var(--color-bg))] relative overflow-hidden">
      {/* Top blue glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(var(--color-primary), 0.10) 0%, transparent 70%)" }}
      />

      <div className="flex-1 flex flex-col w-full max-w-sm mx-auto px-6 py-10 sm:py-14 relative z-10">

        {/* Back button */}
        <div className="flex items-center gap-2.5 mb-10">
          <Link
            to="/login"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgba(var(--color-primary), 0.15)",
            }}
          >
            <ArrowLeft className="w-[18px] h-[18px] text-[rgb(var(--color-fg))]" />
          </Link>
          <span className="text-sm font-semibold text-[rgb(var(--color-muted))]">Volver</span>
        </div>

        {isSubmitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-6 mt-4">
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 12px 32px rgba(var(--color-primary), 0.35)",
              }}
            >
              <CheckCircle className="w-11 h-11 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[rgb(var(--color-fg))]">
                ¡Solicitud Enviada!
              </h1>
              <p className="mt-3 text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                Si el correo existe en nuestro sistema, recibirás las instrucciones en los próximos minutos.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white text-[16px] font-bold"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 6px 20px rgba(var(--color-primary), 0.35)",
              }}
            >
              <LogIn className="w-5 h-5" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Illustration + heading */}
            <div className="flex flex-col items-center text-center gap-5 mb-8">
              <div
                className="w-24 h-24 rounded-[28px] flex items-center justify-center"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "0 12px 32px rgba(var(--color-primary), 0.35)",
                }}
              >
                <MailOpen className="w-11 h-11 text-white" />
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold leading-tight text-[rgb(var(--color-fg))]">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-2 text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <GlassInput
                label="Correo electrónico"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-[18px] h-[18px] text-[rgb(var(--color-primary))]" />}
                error={error ?? undefined}
                required
                autoFocus
              />

              <div className="flex items-center gap-2">
                <Info className="w-[13px] h-[13px] text-[rgb(var(--color-muted))] shrink-0" />
                <span className="text-[12px] text-[rgb(var(--color-muted))]">
                  Recibirás el enlace en los próximos minutos.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValidEmail}
                className="mt-2 w-full h-[56px] rounded-2xl flex items-center justify-center gap-2.5 text-white text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "0 6px 20px rgba(var(--color-primary), 0.35)",
                }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar enlace
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider + back link */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex-1 h-px bg-[rgb(var(--color-glass))]" />
              <span className="text-[11px] text-[rgb(var(--color-muted))]">o</span>
              <div className="flex-1 h-px bg-[rgb(var(--color-glass))]" />
            </div>

            <Link
              to="/login"
              className="mt-5 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[rgb(var(--color-primary))] hover:opacity-80 transition-opacity"
            >
              <LogIn className="w-[14px] h-[14px]" />
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
