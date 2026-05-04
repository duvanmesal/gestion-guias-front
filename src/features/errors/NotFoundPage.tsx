import { useNavigate } from "react-router-dom"
import { Anchor, ArrowLeft, Home } from "lucide-react"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { GlassButton } from "@/shared/components/glass/GlassButton"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[rgb(var(--color-bg))] relative overflow-hidden px-4">
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--color-primary), 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <GlassCard>
          <GlassCardContent>
            <div className="py-8 text-center space-y-6">
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgb(var(--color-primary)/0.12)",
                    border: "1px solid rgb(var(--color-primary)/0.2)",
                  }}
                >
                  <Anchor className="w-10 h-10 text-[rgb(var(--color-primary))]" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-6xl font-black text-[rgb(var(--color-primary))]">404</p>
                <h1 className="text-xl font-bold text-[rgb(var(--color-fg))]">
                  Página no encontrada
                </h1>
                <p className="text-sm text-[rgb(var(--color-muted))] leading-relaxed">
                  La ruta que buscas no existe o fue movida.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <GlassButton variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </GlassButton>
                <GlassButton variant="primary" onClick={() => navigate("/dashboard", { replace: true })}>
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}
