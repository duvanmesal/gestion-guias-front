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
  nombre?: string
}

export interface Puerto {
  id: string
  codigo: string
  nombre: string
  ciudad: string
  paisId?: string
  pais?: PaisMini | null
  status: StatusType
  createdAt?: string
  updatedAt?: string
}

export interface Muelle {
  id: string
  codigo: string
  nombre: string
  puertoId?: string
  puerto?: Pick<Puerto, "id" | "codigo" | "nombre" | "ciudad"> & { pais?: PaisMini | null }
  capacidadCruceros?: number | null
  status: StatusType
  createdAt?: string
  updatedAt?: string
}

export interface Buque {
  id: string
  codigo: string
  nombre: string
  status: StatusType
  paisId?: string | null
  pais?: PaisMini | null
  capacidad?: number | null
  naviera?: string | null
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

export interface PuertosQueryParams {
  page?: number
  pageSize?: number
  q?: string
  paisId?: string
  status?: StatusType
}

export interface MuellesQueryParams {
  page?: number
  pageSize?: number
  q?: string
  puertoId?: string
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
  codigo: string
  nombre: string
  paisId?: string | null
  capacidad?: number | null
  naviera?: string | null
  status?: StatusType
}

export interface CreatePuertoRequest {
  codigo: string
  nombre: string
  ciudad: string
  paisId: string
  status?: StatusType
}

export interface UpdatePuertoRequest {
  codigo?: string
  nombre?: string
  ciudad?: string
  paisId?: string
  status?: StatusType
}

export interface CreateMuelleRequest {
  codigo: string
  nombre: string
  puertoId: string
  capacidadCruceros?: number | null
  status?: StatusType
}

export interface UpdateMuelleRequest {
  codigo?: string
  nombre?: string
  puertoId?: string
  capacidadCruceros?: number | null
  status?: StatusType
}

export interface UpdateBuqueRequest {
  codigo?: string
  nombre?: string
  paisId?: string | null
  capacidad?: number | null
  naviera?: string | null
  status?: StatusType
}
