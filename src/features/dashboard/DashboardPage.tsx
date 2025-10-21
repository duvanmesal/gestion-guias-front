import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { healthApi } from "@/core/api"
import { usersApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { Activity, Users, CheckCircle, AlertCircle, ArrowRight, TrendingUp, Clock } from "lucide-react"

export function DashboardPage() {
  const { user } = useAuthStore()

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30000,
  })

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", { activo: true, pageSize: 1 }],
    queryFn: async () => {
      const response = await usersApi.getUsers({ activo: true, pageSize: 1 })
      return response
    },
    enabled: user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR,
  })

  const canViewUsers = user?.rol === Rol.SUPER_ADMIN || user?.rol === Rol.SUPERVISOR

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="glass-strong p-8 rounded-2xl border border-white/10 hover-lift animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-accent))] to-[rgb(var(--color-primary))] bg-clip-text text-transparent mb-2">
              Dashboard
            </h2>
            <p className="text-[rgb(var(--color-fg)/0.6)] text-base">Bienvenido, {user?.nombres || user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <GlassCard
            hover
            className="animate-fade-in-up hover-lift border border-white/5"
            style={{ animationDelay: "0.05s" }}
          >
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.3)] to-[rgb(var(--color-accent)/0.2)] flex items-center justify-center border border-white/10 relative">
                    <Activity className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] opacity-20 blur-lg -z-10" />
                  </div>
                  <GlassCardTitle className="text-base">Estado del Sistema</GlassCardTitle>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {isLoadingHealth ? (
                <Skeleton height="2rem" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {healthData?.status === "ok" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-xl font-bold text-green-400">Operativo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-xl font-bold text-red-400">Con problemas</span>
                      </>
                    )}
                  </div>
                  {healthData?.db && (
                    <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">Base de datos: {healthData.db}</p>
                  )}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {canViewUsers && (
            <GlassCard
              hover
              className="animate-fade-in-up hover-lift border border-white/5"
              style={{ animationDelay: "0.1s" }}
            >
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--color-accent)/0.3)] to-[rgb(var(--color-primary)/0.2)] flex items-center justify-center border border-white/10 relative">
                      <Users className="w-6 h-6 text-[rgb(var(--color-accent))]" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-primary))] opacity-20 blur-lg -z-10" />
                    </div>
                    <GlassCardTitle className="text-base">Usuarios Activos</GlassCardTitle>
                  </div>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                {isLoadingUsers ? (
                  <Skeleton height="2rem" />
                ) : (
                  <div>
                    <span className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent">
                      {usersData?.meta?.total || 0}
                    </span>
                    <p className="text-sm text-[rgb(var(--color-fg)/0.5)] mt-1.5">Total de usuarios activos</p>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          )}

          <GlassCard
            hover
            className="animate-fade-in-up hover-lift border border-white/5"
            style={{ animationDelay: "0.15s" }}
          >
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center border border-white/10 relative">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-lg -z-10" />
                </div>
                <GlassCardTitle className="text-base">Mi Información</GlassCardTitle>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[rgb(var(--color-fg)/0.4)] uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-fg)/0.4)] uppercase tracking-wider mb-1">Rol</p>
                  <span className="inline-block text-sm px-3 py-1 rounded-lg glass border border-white/10 bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-semibold">
                    {user?.rol}
                  </span>
                </div>
                {user?.nombres && (
                  <div>
                    <p className="text-xs text-[rgb(var(--color-fg)/0.4)] uppercase tracking-wider mb-1">Nombre</p>
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">
                      {user.nombres} {user.apellidos}
                    </p>
                  </div>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <GlassCard className="animate-fade-in-up border border-white/5" style={{ animationDelay: "0.2s" }}>
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <GlassCardTitle>Accesos Rápidos</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/profile"
                className="glass p-5 rounded-xl hover:bg-white/5 transition-all focus-ring group border border-white/5 hover-lift relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[rgb(var(--color-primary)/0.1)] to-transparent rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[rgb(var(--color-fg))]">Mi Perfil</p>
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.3)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">Ver y editar perfil</p>
                </div>
              </a>

              {canViewUsers && (
                <>
                  <a
                    href="/users"
                    className="glass p-5 rounded-xl hover:bg-white/5 transition-all focus-ring group border border-white/5 hover-lift relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[rgb(var(--color-accent)/0.1)] to-transparent rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-[rgb(var(--color-fg))]">Usuarios</p>
                        <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.3)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">Gestionar usuarios</p>
                    </div>
                  </a>

                  {user?.rol === Rol.SUPER_ADMIN && (
                    <a
                      href="/invitations"
                      className="glass p-5 rounded-xl hover:bg-white/5 transition-all focus-ring group border border-white/5 hover-lift relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-[rgb(var(--color-fg))]">Invitaciones</p>
                          <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.3)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-[rgb(var(--color-fg)/0.5)]">Enviar invitaciones</p>
                      </div>
                    </a>
                  )}
                </>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </AppShell>
  )
}
