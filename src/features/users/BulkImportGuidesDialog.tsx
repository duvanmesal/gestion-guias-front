import { useRef, useState } from "react"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { GlassModal, GlassModalFooter } from "@/shared/components/glass/GlassModal"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { usersApi, type BulkGuidesResult } from "@/core/api"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type Mode = "UPSERT" | "CREATE_ONLY"

export function BulkImportGuidesDialog({ isOpen, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>("CREATE_ONLY")
  const [dryRun, setDryRun] = useState(true)
  const [sendInvites, setSendInvites] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BulkGuidesResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setFile(null)
    setResult(null)
    setError(null)
    setLoading(false)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
    setError(null)
  }

  async function handleRun() {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await usersApi.bulkGuidesFile(file, { mode, dryRun, sendInvites })
      if (!res.data) throw new Error("La API no devolvió resultado de importación")
      setResult(res.data)
      if (!dryRun && res.data.failed === 0) {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Error al procesar el archivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Guías"
      size="md"
    >
      <div className="space-y-5">
        {/* Mode */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))] mb-2">Modo de importación</p>
          <div className="flex gap-2">
            {(["CREATE_ONLY", "UPSERT"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  mode === m
                    ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]"
                    : "border-[rgb(var(--color-border))] text-[rgb(var(--color-fg-muted))]"
                }`}
              >
                {m === "CREATE_ONLY" ? "Solo crear nuevos" : "Crear y actualizar"}
              </button>
            ))}
          </div>
        </div>

        {/* Dry run toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setDryRun((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${dryRun ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-border))]"}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${dryRun ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
          <span className="text-sm text-[rgb(var(--color-fg))]">
            Simulación (dry run) — no persiste cambios
          </span>
        </label>

        {/* Send invites toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setSendInvites((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${sendInvites ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-border))]"}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${sendInvites ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
          <span className="text-sm text-[rgb(var(--color-fg))]">
            Enviar invitaciones a guías nuevos
          </span>
        </label>

        {/* File picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-fg-muted))] mb-2">Archivo CSV o XLSX</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[rgb(var(--color-border))] p-6 cursor-pointer hover:border-[rgb(var(--color-primary))] transition-colors"
          >
            {file ? (
              <>
                <FileText className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{file.name}</p>
                <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                  {(file.size / 1024).toFixed(1)} KB — clic para cambiar
                </p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[rgb(var(--color-fg-muted))]" />
                <p className="text-sm text-[rgb(var(--color-fg-muted))]">Arrastra o haz clic para seleccionar</p>
                <p className="text-xs text-[rgb(var(--color-fg-muted))]">CSV o XLSX — máx. 5 MB</p>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl px-3 py-3 text-sm" style={{ background: "rgb(var(--color-danger)/0.08)", border: "1px solid rgb(var(--color-danger)/0.25)", color: "rgb(var(--color-danger))" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgb(var(--color-bg-elevated)/0.6)" }}>
              {result.failed === 0 ? (
                <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))]" />
              ) : (
                <XCircle className="w-4 h-4 text-[rgb(var(--color-danger))]" />
              )}
              <span className="text-sm font-semibold text-[rgb(var(--color-fg))]">
                {result.dryRun ? "Simulación completada" : "Importación completada"}
              </span>
            </div>
            <div className="px-4 py-3 grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Solicitados", value: result.requested },
                { label: "Creados", value: result.created },
                { label: "Actualizados", value: result.updated },
                { label: "Fallidos", value: result.failed },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-lg font-bold text-[rgb(var(--color-fg))]">{value}</p>
                  <p className="text-xs text-[rgb(var(--color-fg-muted))]">{label}</p>
                </div>
              ))}
            </div>
            {result.errors.length > 0 && (
              <div className="px-4 pb-3 max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-[rgb(var(--color-danger))]">
                    Fila {e.row}{e.field ? ` [${e.field}]` : ""}: {e.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModalFooter>
        <GlassButton variant="ghost" onClick={handleClose}>
          Cerrar
        </GlassButton>
        <GlassButton
          variant="primary"
          onClick={handleRun}
          loading={loading}
          disabled={!file}
        >
          {dryRun ? "Simular" : "Importar"}
        </GlassButton>
      </GlassModalFooter>
    </GlassModal>
  )
}
