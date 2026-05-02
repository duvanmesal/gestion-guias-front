import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6 bg-[rgb(var(--color-bg))]">
          <p className="text-2xl font-bold text-[rgb(var(--color-fg))]">Algo salió mal</p>
          <p className="text-sm text-[rgb(var(--color-muted))] text-center max-w-xs">
            Ocurrió un error inesperado. Recarga la página para continuar.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Recargar página
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-xs text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger)/0.08)] rounded-lg p-4 max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
