export type Jurisdiction = "CABA" | "PBA"

export type DemandModelKey =
  | "accidente_trabajo"
  | "enfermedad_profesional"
  | "rechazo_enfermedad_profesional"
  | "rechazo_accidente_trabajo"
  | "accidente_trabajo_lesion_ocular"
  | "queratoconjuntivitis"

export type LawyerProfile = {
  name: string
  email?: string
  phone?: string
  address?: string
  enrollment?: string
}

export type DemandModel = {
  id: string
  jurisdiction: Jurisdiction
  key: DemandModelKey
  title: string
  content: string
  updatedAt: string // ISO
}

export type DemandTemplateState = {
  version: 1
  lawyers: Record<Jurisdiction, LawyerProfile>
  models: DemandModel[]
}

