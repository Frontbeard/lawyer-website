import type { ParagraphInfo, TemplateField } from "../types"

type Layout = {
  hechosSection: string | null
  paragraphs: ParagraphInfo[]
  fields: { id: string; text: string }[]
}

export type LoadedTemplate = {
  title: string
  content: string
  paragraphs: ParagraphInfo[]
  sourceDocxB64: string
  fields: TemplateField[]
  mergedFieldIds: string[]
  /** Plantillas `<w:p>` solo para el bloque HECHOS fusionado (export línea a línea). */
  hechosParagraphExportXml?: string[]
  /** Plantillas `<w:p>` del bloque fusionado «E. Prueba testimonial» (rechazo PROV). */
  pruebaTestimonialParagraphExportXml?: string[]
}

const MERGED_HECHOS_ID = "MERGED_HECHOS"
const MERGED_PRUEBA_TESTIMONIAL_ID = "MERGED_PRUEBA_TESTIMONIAL"
const HECHOS_PLACEHOLDER_PROMPT =
  "Describí los hechos del caso. Cada Enter es un párrafo aparte en Word (formato del modelo). Este texto reemplaza el bloque HECHOS fusionado al exportar."
const PRUEBA_TESTIMONIAL_PLACEHOLDER_PROMPT =
  "Testigos ofrecidos: una línea por testigo. Cada Enter es un párrafo aparte en Word al exportar."

/**
 * Párrafos HECHOS que no entran en MERGED_HECHOS (siguen como campos en su lugar en el documento).
 * Importante: si el párrafo solo es `{{FIELD_xxx}}`, el texto visible está en `fields`, no en `p.text`.
 */
function paragraphExcludedFromHechosMerge(
  p: ParagraphInfo,
  fieldDefaultsById: Map<string, string>,
): boolean {
  const head = (s: string) => s.replace(/^[\s\t]+/, "").toLowerCase()
  if (head(p.text).startsWith("a tales fines") || head(p.text).startsWith("las secuelas descriptas")) {
    return true
  }
  for (const tok of p.tokens) {
    if (tok.type !== "field") continue
    const sample = head(fieldDefaultsById.get(tok.id) ?? "")
    if (sample.startsWith("a tales fines") || sample.startsWith("las secuelas descriptas")) return true
  }
  return false
}

function paragraphHasFixedText(p: ParagraphInfo): boolean {
  return p.tokens.some((t) => t.type === "text" && t.value.trim().length > 0)
}

function fieldFromText(id: string, text: string, kind: "text" | "textarea" | "merged"): TemplateField {
  const label = text.length > 80 ? `${text.slice(0, 77)}...` : text
  return { id, label, defaultValue: text, input: kind }
}

function applyHechosMerge(layout: Layout) {
  const sec = layout.hechosSection
  if (!sec) {
    return {
      paragraphs: layout.paragraphs,
      fields: layout.fields,
      mergedFieldIds: [] as string[],
      hechosParagraphExportXml: undefined as string[] | undefined,
    }
  }

  const idxs: number[] = []
  for (let i = 0; i < layout.paragraphs.length; i++) {
    const p = layout.paragraphs[i]
    if (p.section === sec && !p.isSectionHeader) idxs.push(i)
  }
  if (idxs.length === 0) {
    return {
      paragraphs: layout.paragraphs,
      fields: layout.fields,
      mergedFieldIds: [] as string[],
      hechosParagraphExportXml: undefined as string[] | undefined,
    }
  }

  const fieldDefaultsById = new Map(layout.fields.map((f) => [f.id, f.text]))

  const mergeableIdxs = idxs.filter((i) => {
    const p = layout.paragraphs[i]
    if (paragraphHasFixedText(p)) return false
    if (paragraphExcludedFromHechosMerge(p, fieldDefaultsById)) return false
    return p.tokens.some((t) => t.type === "field")
  })

  const mergedFieldIds: string[] = []
  const placeholderChunks: string[] = []
  for (const i of mergeableIdxs) {
    for (const tok of layout.paragraphs[i].tokens) {
      if (tok.type === "field") mergedFieldIds.push(tok.id)
    }
    if (layout.paragraphs[i].text.trim()) placeholderChunks.push(layout.paragraphs[i].text.trim())
  }

  if (mergedFieldIds.length === 0) {
    return {
      paragraphs: layout.paragraphs,
      fields: layout.fields,
      mergedFieldIds: [] as string[],
      hechosParagraphExportXml: undefined as string[] | undefined,
    }
  }

  const hechosParagraphExportXml = mergeableIdxs
    .map((i) => layout.paragraphs[i].rawXml)
    .filter((x): x is string => typeof x === "string" && x.length > 0)

  const yellowDefaults = mergedFieldIds
    .map((id) => fieldDefaultsById.get(id) ?? "")
    .filter((s) => s.trim().length > 0)
    .join("\n")
    .trim()
  const mergedPlaceholder = yellowDefaults || placeholderChunks.join(" ").slice(0, 1200)

  const newParagraphs = layout.paragraphs.map((p) => ({ ...p }))
  let anchorPlaced = false
  for (const i of mergeableIdxs) {
    if (!anchorPlaced) {
      newParagraphs[i] = {
        ...newParagraphs[i],
        text: `{{${MERGED_HECHOS_ID}}}`,
        tokens: [{ type: "merged", id: MERGED_HECHOS_ID }],
        mergedAnchor: MERGED_HECHOS_ID,
      }
      anchorPlaced = true
    } else {
      newParagraphs[i] = { ...newParagraphs[i], hidden: true }
    }
  }

  const fields = layout.fields
    .filter((f) => !mergedFieldIds.includes(f.id))
    .map((f) => ({ id: f.id, text: f.text }))

  fields.push({ id: MERGED_HECHOS_ID, text: mergedPlaceholder + "\n\n" + HECHOS_PLACEHOLDER_PROMPT })

  return { paragraphs: newParagraphs, fields, mergedFieldIds, hechosParagraphExportXml }
}

type HechosMergeOut = ReturnType<typeof applyHechosMerge>

/** Tras HECHOS: subsección «E. Prueba testimonial» → un solo campo (rechazo PROV). */
function findPruebaTestimonialMergeIndices(paragraphs: ParagraphInfo[]): number[] {
  const eIdx = paragraphs.findIndex((p) => /^E\.\s*Prueba testimonial$/i.test(p.text.trim()))
  if (eIdx < 0) return []
  const mergeIdxs: number[] = []
  for (let j = eIdx + 1; j < paragraphs.length; j++) {
    const p = paragraphs[j]
    if (p.isSectionHeader) break
    const onlyField = p.tokens.length === 1 && p.tokens[0].type === "field"
    if (onlyField) mergeIdxs.push(j)
    else if (!p.tokens.length && !p.text.trim()) continue
    else if (mergeIdxs.length > 0) break
  }
  return mergeIdxs
}

function applyPruebaTestimonialMerge(hechos: HechosMergeOut) {
  const mergeIdxs = findPruebaTestimonialMergeIndices(hechos.paragraphs)
  if (mergeIdxs.length === 0) {
    return { ...hechos, pruebaTestimonialParagraphExportXml: undefined as string[] | undefined }
  }

  const fieldDefaultsById = new Map(hechos.fields.map((f) => [f.id, f.text]))
  const mergedFieldIdsFromPrueba: string[] = []
  for (const i of mergeIdxs) {
    for (const tok of hechos.paragraphs[i].tokens) {
      if (tok.type === "field") mergedFieldIdsFromPrueba.push(tok.id)
    }
  }

  const pruebaTestimonialParagraphExportXml = mergeIdxs
    .map((i) => hechos.paragraphs[i].rawXml)
    .filter((x): x is string => typeof x === "string" && x.length > 0)

  const yellowDefaults = mergedFieldIdsFromPrueba
    .map((id) => fieldDefaultsById.get(id) ?? "")
    .filter((s) => s.trim().length > 0)
    .join("\n")
    .trim()

  const newParagraphs = hechos.paragraphs.map((p) => ({ ...p }))
  let anchorPlaced = false
  for (const i of mergeIdxs) {
    if (!anchorPlaced) {
      newParagraphs[i] = {
        ...newParagraphs[i],
        text: `{{${MERGED_PRUEBA_TESTIMONIAL_ID}}}`,
        tokens: [{ type: "merged", id: MERGED_PRUEBA_TESTIMONIAL_ID }],
        mergedAnchor: MERGED_PRUEBA_TESTIMONIAL_ID,
      }
      anchorPlaced = true
    } else {
      newParagraphs[i] = { ...newParagraphs[i], hidden: true }
    }
  }

  const fields = hechos.fields
    .filter((f) => !mergedFieldIdsFromPrueba.includes(f.id))
    .map((f) => ({ id: f.id, text: f.text }))

  fields.push({
    id: MERGED_PRUEBA_TESTIMONIAL_ID,
    text: yellowDefaults + "\n\n" + PRUEBA_TESTIMONIAL_PLACEHOLDER_PROMPT,
  })

  return {
    paragraphs: newParagraphs,
    fields,
    mergedFieldIds: [...hechos.mergedFieldIds, ...mergedFieldIdsFromPrueba],
    hechosParagraphExportXml: hechos.hechosParagraphExportXml,
    pruebaTestimonialParagraphExportXml,
  }
}

export function buildTemplate(
  sourceDocxB64: string,
  layoutJson: string,
  title: string,
): LoadedTemplate {
  const layout = JSON.parse(layoutJson) as Layout
  const hechos = applyHechosMerge(layout)
  const merged = applyPruebaTestimonialMerge(hechos)

  const fields: TemplateField[] = merged.fields.map((f) => {
    if (f.id === MERGED_HECHOS_ID) return fieldFromText(f.id, f.text, "merged")
    if (f.id === MERGED_PRUEBA_TESTIMONIAL_ID) return fieldFromText(f.id, f.text, "merged")
    const isLong = f.text.length > 120
    return fieldFromText(f.id, f.text, isLong ? "textarea" : "text")
  })

  const content = merged.paragraphs.map((p) => p.text).join("\n")

  return {
    title,
    content,
    paragraphs: merged.paragraphs,
    sourceDocxB64,
    fields,
    mergedFieldIds: merged.mergedFieldIds,
    hechosParagraphExportXml: merged.hechosParagraphExportXml,
    pruebaTestimonialParagraphExportXml: merged.pruebaTestimonialParagraphExportXml,
  }
}
