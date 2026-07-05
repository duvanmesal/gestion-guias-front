import { BulkImportDialog } from "@/shared/components/bulk/BulkImportDialog"
import { usersApi } from "@/core/api"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BulkImportGuidesDialog({ isOpen, onClose, onSuccess }: Props) {
  return (
    <BulkImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Importar Guías"
      description="Carga masiva de guías desde CSV o XLSX"
      toggles={[
        {
          key: "sendInvites",
          label: "Enviar invitaciones a guías nuevos",
          description: "Envía el correo de acceso a las cuentas creadas en esta importación.",
        },
      ]}
      run={async (file, { mode, dryRun, values }) => {
        const res = await usersApi.bulkGuidesFile(file, {
          mode,
          dryRun,
          sendInvites: !!values.sendInvites,
        })
        if (!res.data) throw new Error("La API no devolvió resultado de importación")
        return res.data
      }}
    />
  )
}
