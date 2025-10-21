import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/shared/components/layout/AppShell"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/shared/components/glass/GlassCard"
import { Skeleton } from "@/shared/components/feedback/Skeleton"
import { healthApi } from "@/core/api"
import { usersApi } from "@/core/api"
import { useAuthStore } from "@/app/stores/auth-store"
import { Rol } from "@/core/models/auth"
import { Activity, Users, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export function DashboardPage() {
  const { user } = useAuthStore()

  // Health check query
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.check()
      return response.data
    },
    refetchInterval: 30000,
  })

  // Users count query (only for admins/supervisors)
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
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] bg-clip-text text-transparent mb-2">
            Dashboard
          </h2>
          <p className="text-[rgb(var(--color-fg)/0.6)] text-lg">Bienvenido, {user?.nombres || user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Status Card */}
          <GlassCard hover>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary)/0.3)] to-[rgb(var(--color-accent)/0.2)] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                </div>
                <GlassCardTitle>Estado del Sistema</GlassCardTitle>
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
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">Operativo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">Con problemas</span>
                      </>
                    )}
                  </div>
                  {healthData?.db && (
                    <p className="text-sm text-[rgb(var(--color-fg)/0.6)]">Base de datos: {healthData.db}</p>
                  )}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Active Users Card */}
          {canViewUsers && (
            <GlassCard hover>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--color-accent)/0.3)] to-[rgb(var(--color-primary)/0.2)] flex items-center justify-center">
                    <Users className="w-6 h-6 text-[rgb(var(--color-accent))]" />
                  </div>
                  <GlassCardTitle>Usuarios Activos</GlassCardTitle>
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
                    <p className="text-sm text-[rgb(var(--color-fg)/0.6)] mt-2">Total de usuarios activos</p>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          )}

          {/* User Info Card */}
          <GlassCard hover>
            <GlassCardHeader>
              <GlassCardTitle>Mi Información</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[rgb(var(--color-fg)/0.5)] uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-fg)/0.5)] uppercase tracking-wide mb-1">Rol</p>
                  <span className="inline-block text-sm px-3 py-1 rounded-lg bg-gradient-to-r from-[rgb(var(--color-primary)/0.2)] to-[rgb(var(--color-accent)/0.15)] text-[rgb(var(--color-primary))] font-medium">
                    {user?.rol}
                  </span>
                </div>
                {user?.nombres && (
                  <div>
                    <p className="text-xs text-[rgb(var(--color-fg)/0.5)] uppercase tracking-wide mb-1">Nombre</p>
                    <p className="text-sm font-medium text-[rgb(var(--color-fg))]">
                      {user.nombres} {user.apellidos}
                    </p>
                  </div>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Accesos Rápidos</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/profile" className="glass p-5 rounded-2xl hover:bg-white/10 transition-all focus-ring group">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[rgb(var(--color-fg))]">Mi Perfil</p>
                  <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.4)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[rgb(var(--color-fg)/0.6)]">Ver y editar perfil</p>
              </a>

              {canViewUsers && (
                <>
                  <a href="/users" className="glass p-5 rounded-2xl hover:bg-white/10 transition-all focus-ring group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-[rgb(var(--color-fg))]">Usuarios</p>
                      <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.4)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-[rgb(var(--color-fg)/0.6)]">Gestionar usuarios</p>
                  </a>

                  {user?.rol === Rol.SUPER_ADMIN && (
                    <a
                      href="/invitations"
                      className="glass p-5 rounded-2xl hover:bg-white/10 transition-all focus-ring group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-[rgb(var(--color-fg))]">Invitaciones</p>
                        <ArrowRight className="w-4 h-4 text-[rgb(var(--color-fg)/0.4)] group-hover:text-[rgb(var(--color-primary))] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-[rgb(var(--color-fg)/0.6)]">Enviar invitaciones</p>
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
