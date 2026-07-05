import { BulkImportDialog } from "@/shared/components/bulk/BulkImportDialog"
import { recaladasApi } from "@/core/api"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BulkImportRecaladasDialog({ isOpen, onClose, onSuccess }: Props) {
  return (
    <BulkImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="Importar Recaladas"
      description="Carga masiva de recaladas desde CSV o XLSX"
      feminine
      run={async (file, { mode, dryRun }) => {
        const res = await recaladasApi.bulkRecaladasFile(file, { mode, dryRun })
        if (!res.data) throw new Error("La API no devolvió resultado de importación")
        return res.data
      }}
    />
  )
}
