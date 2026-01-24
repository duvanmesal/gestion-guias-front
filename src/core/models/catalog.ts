export type StatusType = "ACTIVO" | "INACTIVO"

export interface Pais {
  id: string
  codigo: string
  nombre: string
  status: StatusType
  createdAt?: string
  updatedAt?: string
}

export interface PaisMini {
  id: string
  codigo: string
  nombre: string
}

export interface Buque {
  id: string
  nombre: string
  status: StatusType
  paisId?: string | null
  pais?: PaisMini | null
  createdAt?: string
  updatedAt?: string
}

export interface PaisesQueryParams {
  page?: number
  pageSize?: number
  q?: string
  codigo?: string
  status?: StatusType
}

export interface BuquesQueryParams {
  page?: number
  pageSize?: number
  q?: string
  paisId?: string
  status?: StatusType
}

export interface CreatePaisRequest {
  codigo: string
  nombre: string
  status?: StatusType
}

export interface UpdatePaisRequest {
  codigo?: string
  nombre?: string
  status?: StatusType
}

export interface CreateBuqueRequest {
  nombre: string
  paisId?: string | null
  status?: StatusType
}

export interface UpdateBuqueRequest {
  nombre?: string
  paisId?: string | null
  status?: StatusType
}
