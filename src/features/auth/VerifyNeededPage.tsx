"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, LogOut, Ship, CheckCircle, AlertCircle } from "lucide-react";

import { GlassCard, GlassButton } from "@/shared/components/glass";
import { Spinner } from "@/shared/components/feedback";
import { usersApi, authApi } from "@/core/api";
import { useAuthStore } from "@/app/stores/auth-store";

export function VerifyNeededPage() {
  const navigate = useNavigate();
  const { user, clearSession, updateUser } = useAuthStore();

  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * =========================================================
   * 🔑 HIDRATAR USUARIO REAL (SOLO /users/me)
   * =========================================================
   */
  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const me = await usersApi.getMe();
        if (mounted && me.data) {
          updateUser(me.data);
        }
      } catch {
        // silencio: el guard decidirá
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, [updateUser]);

  /**
   * =========================================================
   * 📩 REENVIAR VERIFICACIÓN
   * =========================================================
   */
  const handleResendVerification = async () => {
    let email = user?.email;

    // Si por alguna razón no hay email en store, rehidratamos con /users/me
    if (!email) {
      try {
        const me = await usersApi.getMe();
        if (me.data) {
          updateUser(me.data);
          email = me.data.email;
        }
      } catch {
        // seguimos
      }
    }

    if (!email) {
      setError(
        "No encontramos tu correo en la sesión. Cierra sesión e ingresa de nuevo."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestEmailVerification({ email });
      setIsSuccess(true);
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * =========================================================
   * 🚪 LOGOUT
   * =========================================================
   */
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  /**
   * =========================================================
   * ⏳ LOADING INICIAL
   * =========================================================
   */
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
        <GlassCard className="w-full max-w-md">
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
              Verificando estado de tu cuenta...
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  /**
   * =========================================================
   * 🖼️ UI
   * =========================================================
   */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--color-bg))]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <Ship className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">
            Verificación Requerida
          </h1>
          <p className="text-[rgb(var(--color-fg)/0.7)] mt-2">
            CORPOTURISMO - Sistema de Gestión de Guías
          </p>
        </div>

        <div className="space-y-6">
          {/* Info */}
          <div className="glass-subtle p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-medium text-[rgb(var(--color-fg))] mb-1">
                  Verifica tu correo para continuar
                </h3>
                <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
                  Por seguridad, necesitas verificar tu correo electrónico antes
                  de acceder al sistema.
                </p>
              </div>
            </div>
          </div>

          {user?.email && (
            <div className="text-center py-2">
              <p className="text-sm text-[rgb(var(--color-fg)/0.7)]">
                Correo registrado:
              </p>
              <p className="font-medium text-[rgb(var(--color-fg))]">
                {user.email}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
              <AlertCircle className="w-5 h-5 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-primary font-medium">
                  Correo de verificación enviado
                </p>
                <p className="text-sm text-[rgb(var(--color-fg)/0.7)] mt-1">
                  Revisa tu bandeja de entrada y haz clic en el enlace.
                </p>
              </div>
            </div>
          )}

          <GlassButton
            variant="primary"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {isSuccess ? "Reenviar Verificación" : "Enviar Verificación"}
              </>
            )}
          </GlassButton>

          <div className="pt-4 border-t border-[rgb(var(--color-fg)/0.1)]">
            <GlassButton
              variant="ghost"
              className="w-full text-danger hover:bg-danger/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
