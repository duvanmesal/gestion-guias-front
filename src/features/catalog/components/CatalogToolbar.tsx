'use client';

import React from "react"
import { Search, Filter, Plus } from "lucide-react"
import { GlassInput } from "@/shared/components/glass/GlassInput"
import { GlassSelect } from "@/shared/components/glass/GlassSelect"
import { GlassButton } from "@/shared/components/glass/GlassButton"
import { GlassCard, GlassCardContent } from "@/shared/components/glass/GlassCard"

interface CatalogToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onCreateClick?: () => void
  createLabel?: string
  canCreate?: boolean
  extraFilters?: React.ReactNode
}

export function CatalogToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateClick,
  createLabel = "Nuevo",
  canCreate = false,
  extraFilters,
}: CatalogToolbarProps) {
  return (
    <GlassCard className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
      <GlassCardContent>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[rgb(var(--color-primary))]" />
          <span className="text-sm font-medium text-[rgb(var(--color-muted))]">
            Filtros
          </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlassInput
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <GlassSelect
              options={[
                { value: "", label: "Todos los estados" },
                { value: "ACTIVO", label: "Activos" },
                { value: "INACTIVO", label: "Inactivos" },
              ]}
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            />

            {extraFilters}
          </div>

          {canCreate && onCreateClick && (
            <GlassButton
              variant="primary"
              onClick={onCreateClick}
              className="whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {createLabel}
            </GlassButton>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
