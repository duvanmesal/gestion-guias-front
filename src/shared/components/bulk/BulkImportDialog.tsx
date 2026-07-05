import { useRef, useState, type DragEvent } from "react"
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassButton } from "@/shared/components/glass/GlassButton"

export type BulkImportResult = {
  dryRun: boolean
  requested: number
  created: number
  updated: number
  skipped: number
  failed: number
  errors: { row: number; field?: string; message: string }[]
}

export type BulkImportMode = "UPSERT" | "CREATE_ONLY"

export interface BulkImportToggle {
  key: string
  label: string
  description?: string
  defaultValue?: boolean
}

interface BulkImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title: string
  description?: string
  /** Ajusta el género de las etiquetas: "Creadas/Fallidas" vs "Creados/Fallidos" */
  feminine?: boolean
  toggles?: BulkImportToggle[]
  run: (
    file: File,
    opts: { mode: BulkImportMode; dryRun: boolean; values: Record<string, boolean> },
  ) => Promise<BulkImportResult>
}

const MAX_SIZE = 5 * 1024 * 1024
const VALID_EXT = /\.(csv|xlsx|xls)$/i

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`
}

export function BulkImportDialog({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  feminine = false,
  toggles = [],
  run,
}: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<BulkImportMode>("CREATE_ONLY")
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(toggles.map((t) => [t.key, t.defaultValue ?? false])),
  )
  const [pending, setPending] = useState<"verify" | "import" | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const L = feminine
    ? { created: "Creadas", updated: "Actualizadas", skipped: "Omitidas", failed: "Fallidas", createOnly: "Solo crear nuevas" }
    : { created: "Creados", updated: "Actualizados", skipped: "Omitidos", failed: "Fallidos", createOnly: "Solo crear nuevos" }

  const verified = result !== null && result.dryRun
  const done = result !== null && !result.dryRun
  const importable = verified ? result.created + result.updated : 0

  function handleClose() {
    setFile(null)
    setResult(null)
    setError(null)
    setPending(null)
    setDragOver(false)
    onClose()
  }

  function selectFile(f: File) {
    if (!VALID_EXT.test(f.name)) {
      setError("Formato no soportado. Usa un archivo CSV o XLSX.")
      return
    }
    if (f.size > MAX_SIZE) {
      setError(`El archivo pesa ${formatSize(f.size)}. El máximo permitido es 5 MB.`)
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  function clearFile() {
    setFile(null)
    setResult(null)
    setError(null)
  }

  function changeMode(m: BulkImportMode) {
    setMode(m)
    setResult(null)
  }

  function changeToggle(key: string) {
    setValues((v) => ({ ...v, [key]: !v[key] }))
    setResult(null)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (done) return
    const f = e.dataTransfer.files?.[0]
    if (f) selectFile(f)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false)
  }

  async function execute(dryRun: boolean) {
    if (!file) return
    setPending(dryRun ? "verify" : "import")
    setResult(null)
    setError(null)
    try {
      const res = await run(file, { mode, dryRun, values })
      setResult(res)
      if (!dryRun && (res.created + res.updated > 0 || res.failed === 0)) {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Error al procesar el archivo")
    } finally {
      setPending(null)
    }
  }

  const modeHint =
    mode === "CREATE_ONLY"
      ? "Las filas que ya existen en el sistema se omiten."
      : "Las filas existentes se actualizan con los datos del archivo."

  const total = result
    ? Math.max(result.created + result.updated + result.skipped + result.failed, 1)
    : 1

  const statusIcon = !result ? null : result.failed === 0 ? (
    <CheckCircle2 className="w-4.5 h-4.5" style={{ color: "rgb(var(--color-success))" }} />
  ) : result.created + result.updated + result.skipped > 0 ? (
    <AlertTriangle className="w-4.5 h-4.5" style={{ color: "rgb(var(--color-warning))" }} />
  ) : (
    <XCircle className="w-4.5 h-4.5" style={{ color: "rgb(var(--color-danger))" }} />
  )

  const stats = result
    ? [
        { label: L.created, value: result.created, color: "var(--color-success)" },
        { label: L.updated, value: result.updated, color: "var(--color-info)" },
        { label: L.skipped, value: result.skipped, color: "var(--color-muted)" },
        { label: L.failed, value: result.failed, color: "var(--color-danger)" },
      ]
    : []

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} title={title} description={description} size="md">
      <div className="space-y-5">
        {/* Dropzone / archivo seleccionado */}
        <div
          onDragOver={(e) => { e.preventDefault(); if (!done) setDragOver(true) }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) selectFile(f)
              e.target.value = ""
            }}
          />
          {file ? (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 animate-scale-in"
              style={{
                background: "rgba(var(--color-primary), 0.05)",
                border: "1px solid rgba(var(--color-primary), 0.18)",
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                style={{ background: "rgba(var(--color-primary), 0.10)" }}
              >
                <FileSpreadsheet className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[rgb(var(--color-fg))] truncate">{file.name}</p>
                <p className="text-xs text-[rgb(var(--color-muted))]">
                  {formatSize(file.size)} · {file.name.split(".").pop()?.toUpperCase()}
                </p>
              </div>
              {!done && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 rounded-lg motion-pressable focus-ring hover:bg-[rgba(var(--color-border),0.06)]"
                  aria-label="Quitar archivo"
                >
                  <X className="w-4 h-4 text-[rgb(var(--color-muted))]" />
                </button>
              )}
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileRef.current?.click()
                }
              }}
              className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer focus-ring motion-pressable"
              style={{
                borderColor: dragOver ? "rgb(var(--color-primary))" : "rgba(var(--color-border), 0.18)",
                background: dragOver ? "rgba(var(--color-primary), 0.05)" : "transparent",
                transition: "border-color var(--motion-fast) var(--ease-out-soft), background-color var(--motion-fast) var(--ease-out-soft)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  background: "rgba(var(--color-primary), 0.08)",
                  transform: dragOver ? "scale(1.08)" : "scale(1)",
                  transition: "transform var(--motion-fast) var(--ease-spring-soft)",
                }}
              >
                <Upload className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <p className="text-sm font-medium text-[rgb(var(--color-fg))]">
                {dragOver ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
              </p>
              <p className="text-xs text-[rgb(var(--color-muted))]">
                o haz clic para buscarlo · CSV o XLSX · máx. 5 MB
              </p>
            </div>
          )}
        </div>

        {/* Opciones — ocultas cuando la importación ya se ejecutó */}
        {!done && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-muted))] mb-2">
                Modo de importación
              </p>
              <div
                className="flex gap-1 rounded-xl p-1"
                style={{
                  background: "rgba(var(--color-border), 0.04)",
                  border: "1px solid rgba(var(--color-border), 0.06)",
                }}
              >
                {(["CREATE_ONLY", "UPSERT"] as BulkImportMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => changeMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm motion-pressable focus-ring ${
                      mode === m ? "font-semibold" : "font-medium"
                    }`}
                    style={
                      mode === m
                        ? {
                            background: "rgba(var(--color-primary), 0.10)",
                            color: "rgb(var(--color-primary))",
                            boxShadow: "inset 0 0 0 1px rgba(var(--color-primary), 0.25)",
                          }
                        : { color: "rgb(var(--color-muted))" }
                    }
                  >
                    {m === "CREATE_ONLY" ? L.createOnly : "Crear y actualizar"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[rgb(var(--color-muted))] mt-1.5">{modeHint}</p>
            </div>

            {toggles.map((t) => (
              <button
                key={t.key}
                type="button"
                role="switch"
                aria-checked={values[t.key]}
                onClick={() => changeToggle(t.key)}
                className="w-full flex items-center justify-between gap-4 text-left focus-ring rounded-lg"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-[rgb(var(--color-fg))]">{t.label}</span>
                  {t.description && (
                    <span className="block text-xs text-[rgb(var(--color-muted))] mt-0.5">{t.description}</span>
                  )}
                </span>
                <span
                  className="relative w-10 h-6 rounded-full shrink-0"
                  style={{
                    background: values[t.key] ? "rgb(var(--color-primary))" : "rgba(var(--color-border), 0.18)",
                    transition: "background-color var(--motion-fast) var(--ease-out-soft)",
                  }}
                >
                  <span
                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                    style={{
                      transform: values[t.key] ? "translateX(16px)" : "translateX(0)",
                      transition: "transform var(--motion-fast) var(--ease-spring-soft)",
                    }}
                  />
                </span>
              </button>
            ))}

            {!verified && (
              <p className="flex items-center gap-1.5 text-xs text-[rgb(var(--color-muted))]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                El archivo se verifica primero en modo simulación; nada se guarda hasta que confirmes.
              </p>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 rounded-xl px-3 py-3 text-sm motion-error"
            style={{
              background: "rgba(var(--color-danger), 0.08)",
              border: "1px solid rgba(var(--color-danger), 0.25)",
              color: "rgb(var(--color-danger))",
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Procesando */}
        {pending && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3.5"
            style={{ background: "rgba(var(--color-border), 0.03)", border: "1px solid rgba(var(--color-border), 0.06)" }}
          >
            <Loader2 className="w-4.5 h-4.5 animate-spin text-[rgb(var(--color-primary))]" />
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-fg))]">
                {pending === "verify" ? "Verificando archivo…" : "Importando registros…"}
              </p>
              <p className="text-xs text-[rgb(var(--color-muted))]">Validando filas y columnas del archivo</p>
            </div>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div
            className="rounded-xl overflow-hidden animate-fade-in-up"
            style={{ border: "1px solid rgba(var(--color-border), 0.08)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2.5"
              style={{ background: "rgba(var(--color-border), 0.03)" }}
            >
              {statusIcon}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                  {result.dryRun ? "Verificación completada" : "Importación completada"}
                </p>
                <p className="text-xs text-[rgb(var(--color-muted))]">
                  {result.requested} {result.requested === 1 ? "fila procesada" : "filas procesadas"}
                  {result.dryRun && " · simulación, sin cambios guardados"}
                </p>
              </div>
            </div>

            {/* Barra de distribución */}
            <div className="px-4 pt-3">
              <div className="flex h-1.5 rounded-full overflow-hidden animate-reveal-ltr" style={{ background: "rgba(var(--color-border), 0.06)" }}>
                {stats.map(
                  ({ label, value, color }) =>
                    value > 0 && (
                      <div
                        key={label}
                        style={{ width: `${(value / total) * 100}%`, background: `rgb(${color})` }}
                      />
                    ),
                )}
              </div>
            </div>

            <div className="px-4 py-3 grid grid-cols-4 gap-2">
              {stats.map(({ label, value, color }) => (
                <div key={label} className="text-center rounded-lg py-2" style={{ background: "rgba(var(--color-border), 0.03)" }}>
                  <p
                    className="text-lg font-bold tabular-nums animate-num-pop"
                    style={{ color: label === L.failed && value > 0 ? "rgb(var(--color-danger))" : "rgb(var(--color-fg))" }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] text-[rgb(var(--color-muted))] flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `rgb(${color})` }} />
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {result.errors.length > 0 && (
              <div className="border-t" style={{ borderColor: "rgba(var(--color-border), 0.06)" }}>
                <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-muted))]">
                  Errores ({result.errors.length})
                </p>
                <div className="px-4 pb-3 max-h-40 overflow-y-auto space-y-1.5">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded-md shrink-0 mt-px"
                        style={{ background: "rgba(var(--color-danger), 0.08)", color: "rgb(var(--color-danger))" }}
                      >
                        Fila {e.row}
                      </span>
                      <p className="text-xs text-[rgb(var(--color-fg-secondary))] min-w-0">
                        {e.field && <span className="font-medium text-[rgb(var(--color-fg))]">{e.field}: </span>}
                        {e.message}
                      </p>
                    </div>
                  ))}
                </div>
                {verified && importable === 0 && (
                  <p className="px-4 pb-3 text-xs text-[rgb(var(--color-muted))]">
                    Corrige los errores en el archivo y vuelve a cargarlo para continuar.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModalFooter>
        {done ? (
          <GlassButton variant="primary" onClick={handleClose}>
            Listo
          </GlassButton>
        ) : (
          <>
            <GlassButton variant="ghost" onClick={handleClose}>
              Cancelar
            </GlassButton>
            {verified ? (
              <GlassButton
                variant="primary"
                onClick={() => execute(false)}
                loading={pending === "import"}
                disabled={importable === 0}
              >
                Importar {importable} {importable === 1 ? "registro" : "registros"}
              </GlassButton>
            ) : (
              <GlassButton
                variant="primary"
                onClick={() => execute(true)}
                loading={pending === "verify"}
                disabled={!file}
              >
                Verificar archivo
              </GlassButton>
            )}
          </>
        )}
      </GlassModalFooter>
    </GlassModal>
  )
}
