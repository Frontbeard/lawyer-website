export type Jurisdiction = "CABA" | "PBA"

export type DemandModelKey =
  | "accidente_trabajo"
  | "accidente_trabajo_lesion_ocular"
  | "rechazo_querato"
  | "rechazo_accidente_trabajo"
  | "rechazo_enfermedad_profesional"
  | "rechazo_accidente_in_itinere"
  | "rechazo_prov"
  | "rechazo_accidente_prov"
  | "rechazo_caba"
  | "rechazo_accidente_caba"

export type LawyerProfile = {
  name: string
  email?: string
  phone?: string
  address?: string
  enrollment?: string
}

export type ParagraphInline =
  | { type: "text"; value: string }
  | { type: "field"; id: string }
  | { type: "merged"; id: string }

export type ParagraphInfo = {
  text: string
  tokens: ParagraphInline[]
  align: "left" | "center" | "right" | "both" | null
  indent: { left: number; firstLine: number; hanging: number } | null
  bold: boolean
  italic: boolean
  size: number | null
  section: string | null
  isSectionHeader: boolean
  sectionTitle: string | null
  /** Hidden when a merged field replaces this paragraph. */
  hidden?: boolean
  /** True for the placeholder paragraph that anchors the merged textarea. */
  mergedAnchor?: string
  /** Fragmento XML original del párrafo Word (`<w:p>…</w:p>`), si viene del extractor. */
  rawXml?: string
}

export type TemplateField = {
  id: string
  label: string
  defaultValue: string
  /** "text" inline input, "textarea" block input, "merged" big block (full HECHOS section). */
  input: "text" | "textarea" | "merged"
}

export type DemandModel = {
  id: string
  jurisdiction: Jurisdiction
  key: DemandModelKey
  title: string
  /** Flat body (with {{FIELD_xxx}} tokens) — kept for fallback rendering only. */
  content: string
  /** Structured paragraph data — primary rendering source. */
  paragraphs?: ParagraphInfo[]
  /** Source .docx as base64. Used by export to preserve original formatting. */
  sourceDocxB64?: string
  /** Field index ids that are merged into a single mega-field (e.g. HECHOS). */
  mergedFieldIds?: string[]
  /** Un `<w:p>…</w:p>` por párrafo del cuerpo HECHOS (orden); export usa uno por línea del texto unificado. */
  hechosParagraphExportXml?: string[]
  /** Igual que HECHOS: plantillas de párrafo para el bloque fusionado «E. Prueba testimonial» (rechazo PROV). */
  pruebaTestimonialParagraphExportXml?: string[]
  updatedAt: string
  fields?: TemplateField[]
}

export type DemandTemplateState = {
  /** Incrementado al cambiar catálogo de plantillas (seed); fuerza migración en storage. */
  version: number
  lawyers: Record<Jurisdiction, LawyerProfile>
  models: DemandModel[]
}
