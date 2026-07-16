import { BulkImportDialog } from "@/shared/components/bulk/BulkImportDialog"
import { recaladasApi } from "@/core/api"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BulkImportRecaladasDialog({ isOpen, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ["recaladas"] })
    void queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    void queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] })
    onSuccess?.()
  }

  return (
    <BulkImportDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
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
