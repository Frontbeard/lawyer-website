import JSZip from "jszip"
import { saveAs } from "file-saver"
import type { DemandModel, Jurisdiction, LawyerProfile } from "./types"

export const MERGED_HECHOS_ID = "MERGED_HECHOS"
export const MERGED_PRUEBA_TESTIMONIAL_ID = "MERGED_PRUEBA_TESTIMONIAL"

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function base64ToUint8Array(b64: string) {
  const cleaned = b64.replace(/\s+/g, "")
  const bin = atob(cleaned)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function fieldIdAt(idx: number) {
  return "FIELD_" + String(idx).padStart(3, "0")
}

function rprInnerFromRun(runInner: string): string | null {
  const m = runInner.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
  return m ? m[1] : null
}

function highlightValFromRpr(rprInner: string): string | null {
  const m = rprInner.match(/<w:highlight\b[^>]*w:val="([^"]+)"/i)
  return m ? m[1].toLowerCase() : null
}

function shdFillFromRpr(rprInner: string): string | null {
  const m = rprInner.match(/<w:shd\b[^>]*w:fill="([^"]+)"/i)
  if (!m) return null
  const f = m[1].trim().toUpperCase()
  if (!f || f === "AUTO") return null
  return f.replace(/^#/, "")
}

/** Valores OOXML de “verde” que Word puede usar según tema / versión */
function isGreenHighlightName(v: string): boolean {
  return v === "green" || v === "darkgreen" || v === "lightgreen"
}

function isYellowHighlightName(v: string): boolean {
  return v === "yellow" || v === "darkyellow"
}

/** Sombreado amarillo típico (alternativa al resaltador amarillo). */
const YELLOW_SHD_FILLS = new Set([
  "FFFF00",
  "FFE699",
  "FFF2CC",
  "FFFACD",
  "FFFF99",
  "FFEB9C",
])

/** Sombreado verde típico (alternativa al resaltador verde). */
const GREEN_SHD_FILLS = new Set([
  "C6EFCE",
  "D9EAD3",
  "E2EFDA",
  "92D050",
  "00B050",
  "548235",
  "70AD47",
  "A8D08D",
])

function fillLooksYellowField(hex: string): boolean {
  const h = hex.replace(/^#/, "").toUpperCase()
  if (YELLOW_SHD_FILLS.has(h)) return true
  if (h.length === 6 && /^[0-9A-F]+$/i.test(h)) {
    const r = Number.parseInt(h.slice(0, 2), 16)
    const g = Number.parseInt(h.slice(2, 4), 16)
    const b = Number.parseInt(h.slice(4, 6), 16)
    return r > 210 && g > 200 && b < 160
  }
  return false
}

/** Verde “marcador” (negrita al exportar); distinto del amarillo por RGB. */
function fillLooksGreenBold(hex: string): boolean {
  const h = hex.replace(/^#/, "").toUpperCase()
  if (GREEN_SHD_FILLS.has(h)) return true
  if (fillLooksYellowField(hex)) return false
  if (h.length === 6 && /^[0-9A-F]+$/i.test(h)) {
    const r = Number.parseInt(h.slice(0, 2), 16)
    const g = Number.parseInt(h.slice(2, 4), 16)
    const b = Number.parseInt(h.slice(4, 6), 16)
    return g >= 110 && g > r + 30 && g > b + 25
  }
  return false
}

/** Amarillo o verde (resaltador u homólogo por sombreado) = campo editable. */
function isFieldHighlightRun(runInner: string): boolean {
  const rpr = rprInnerFromRun(runInner)
  if (!rpr) return false
  const hv = highlightValFromRpr(rpr)
  if (hv) return isYellowHighlightName(hv) || isGreenHighlightName(hv)
  const fill = shdFillFromRpr(rpr)
  if (!fill) return false
  return fillLooksYellowField(fill) || fillLooksGreenBold(fill)
}

/** Verde en plantilla ⇒ negrita en el .docx exportado (resaltador o sombreado verde). */
function isGreenRun(runInner: string): boolean {
  const rpr = rprInnerFromRun(runInner)
  if (!rpr) return false
  const hv = highlightValFromRpr(rpr)
  if (hv) return isGreenHighlightName(hv)
  const fill = shdFillFromRpr(rpr)
  return !!fill && fillLooksGreenBold(fill)
}

function decodeXmlText(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
}

/** Texto visible de un `<w:r>` (varios `<w:t>` / tabs / saltos). */
function extractRunPlainText(runInner: string): string {
  let out = ""
  const re = /<w:(t|tab|br|cr)\b([^>]*)(?:\/>|>([\s\S]*?)<\/w:\1>)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(runInner)) !== null) {
    const tag = m[1]
    const inner = m[3] ?? ""
    if (tag === "t") out += decodeXmlText(inner)
    else if (tag === "tab") out += "\t"
    else if (tag === "br" || tag === "cr") out += "\n"
  }
  return out
}

/**
 * Reparte el valor del usuario entre varios runs según la longitud relativa del texto modelo.
 * Si el redondeo deja runs vacíos (típico run verde entre amarillos con texto corto), reparte en partes
 * iguales para que el run central no pierda la negrita.
 */
function splitUserAcrossRuns(userVal: string, templateParts: string[]): string[] {
  const n = templateParts.length
  if (n === 0) return []
  if (n === 1) return [userVal]
  const weights = templateParts.map((t) => Math.max(t.length, 1))
  const W = weights.reduce((a, b) => a + b, 0)
  const L = userVal.length
  let offset = 0
  const out: string[] = []
  for (let i = 0; i < n - 1; i++) {
    const len = Math.round((L * weights[i]) / W)
    out.push(userVal.slice(offset, offset + len))
    offset += len
  }
  out.push(userVal.slice(offset))

  if (L > 0 && L >= n && out.some((s) => s.length === 0)) {
    const base = Math.floor(L / n)
    let extra = L % n
    const fixed: string[] = []
    let pos = 0
    for (let i = 0; i < n; i++) {
      const take = base + (extra > 0 ? 1 : 0)
      if (extra > 0) extra--
      fixed.push(userVal.slice(pos, pos + take))
      pos += take
    }
    return fixed
  }
  return out
}

function forEachFieldRunGroup(paraXml: string, fn: (group: RegExpMatchArray[]) => void) {
  const matches = [...paraXml.matchAll(/(<w:r\b[^>]*>)([\s\S]*?)(<\/w:r>)/g)]
  let k = 0
  while (k < matches.length) {
    if (!isFieldHighlightRun(matches[k][2])) {
      k++
      continue
    }
    let end = k + 1
    while (end < matches.length) {
      const between = paraXml.slice(
        matches[end - 1].index! + matches[end - 1][0].length,
        matches[end].index,
      )
      if (/<w:r\b/.test(between)) break
      if (!isFieldHighlightRun(matches[end][2])) break
      end++
    }
    fn(matches.slice(k, end))
    k = end
  }
}

/**
 * Quita resaltado del modelo; opcionalmente fuerza negrita (verde) o texto normal (amarillo).
 * Sin `bold`, conserva negrita previa del run salvo highlight.
 */
function rebuildRun(
  openR: string,
  inner: string,
  closeR: string,
  newText: string,
  bold?: boolean,
) {
  const rprMatch = inner.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
  const tail = inner.match(/<w:tab\b[^>]*\/?>/g) ?? []
  let out = ""
  if (rprMatch) {
    let rprInner = rprMatch[1]
      .replace(/<w:highlight\b[^>]*\/?>/g, "")
      .replace(/<w:shd\b[^>]*\/?>/g, "")
      .trim()
    if (bold === true) {
      if (!/<w:b\b/.test(rprInner)) rprInner += '<w:b w:val="1"/><w:bCs w:val="1"/>'
    } else if (bold === false) {
      rprInner = rprInner.replace(/<w:b\b[^>]*\/?>/g, "").replace(/<w:bCs\b[^>]*\/?>/g, "")
    }
    if (rprInner) out += `<w:rPr>${rprInner}</w:rPr>`
  } else if (bold === true) {
    out += `<w:rPr><w:b w:val="1"/><w:bCs w:val="1"/></w:rPr>`
  }
  if (newText) out += `<w:t xml:space="preserve">${escapeXml(newText)}</w:t>`
  for (const t of tail) out += t
  return openR + out + closeR
}

function patchParagraphFieldRuns(
  paraXml: string,
  vals: Record<string, string>,
  mergedFieldIds: Set<string>,
  bumpFieldGroup: () => number,
): string {
  const matches = [...paraXml.matchAll(/(<w:r\b[^>]*>)([\s\S]*?)(<\/w:r>)/g)]
  let cursor = 0
  let out = ""
  let k = 0
  while (k < matches.length) {
    const inner = matches[k][2]
    if (!isFieldHighlightRun(inner)) {
      out += paraXml.slice(cursor, matches[k].index! + matches[k][0].length)
      cursor = matches[k].index! + matches[k][0].length
      k++
      continue
    }
    let end = k + 1
    while (end < matches.length) {
      const between = paraXml.slice(
        matches[end - 1].index! + matches[end - 1][0].length,
        matches[end].index,
      )
      if (/<w:r\b/.test(between)) break
      if (!isFieldHighlightRun(matches[end][2])) break
      end++
    }
    out += paraXml.slice(cursor, matches[k].index!)
    const group = matches.slice(k, end)
    const idx = bumpFieldGroup()
    const id = fieldIdAt(idx)
    const userVal = (vals[id] ?? "").replace(/\r?\n/g, " ")
    if (mergedFieldIds.has(id)) {
      out += group.map((m) => m[0]).join("")
    } else if (group.length === 1 && userVal.includes("**")) {
      const m = group[0]
      out += mergeRunsWithBoldMarkup(m[1], m[2], m[3], userVal)
    } else {
      const templateParts = group.map((m) => extractRunPlainText(m[2]))
      const hasGreen = group.some((m) => isGreenRun(m[2]))
      const segments =
        group.length === 1
          ? [userVal]
          : hasGreen
            ? splitUserAcrossRuns(userVal, templateParts)
            : (() => {
                const segs = Array.from({ length: group.length }, () => "")
                segs[0] = userVal
                return segs
              })()
      for (let i = 0; i < group.length; i++) {
        const bold = isGreenRun(group[i][2])
        out += rebuildRun(group[i][1], group[i][2], group[i][3], segments[i] ?? "", bold)
      }
    }
    cursor = matches[end - 1].index! + matches[end - 1][0].length
    k = end
  }
  out += paraXml.slice(cursor)
  return out
}

/** Trozos normales / negrita a partir de `**así**` en el valor del campo (solo exportación Word). */
function splitBoldSegments(text: string): { bold: boolean; text: string }[] {
  if (!text.includes("**")) return [{ bold: false, text }]
  const parts: { bold: boolean; text: string }[] = []
  const re = /\*\*([\s\S]*?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ bold: false, text: text.slice(last, m.index) })
    parts.push({ bold: true, text: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ bold: false, text: text.slice(last) })
  return parts.length ? parts : [{ bold: false, text }]
}

/** Varias `<w:r>` con/sin `<w:b>` según `**…**`, conservando fuente/tamaño del run modelo (sin resaltado). */
function mergeRunsWithBoldMarkup(openR: string, inner: string, closeR: string, userVal: string): string {
  const segments = splitBoldSegments(userVal).filter((s) => s.text.length > 0)
  if (segments.length === 0) return rebuildRun(openR, inner, closeR, "")
  if (segments.length === 1 && !segments[0].bold) {
    return rebuildRun(openR, inner, closeR, segments[0].text)
  }

  const openTag = openR.match(/^<w:r\b[^>]*>/)?.[0] ?? "<w:r>"
  const rprMatch = inner.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
  const baseInner = rprMatch
    ? rprMatch[1]
        .replace(/<w:highlight\b[^>]*\/?>/g, "")
        .replace(/<w:shd\b[^>]*\/?>/g, "")
        .trim()
    : ""
  const tabs = inner.match(/<w:tab\b[^>]*\/?>/g) ?? []

  function rprXml(bold: boolean): string {
    let x = baseInner
    if (bold) {
      if (!/<w:b\b/.test(x)) x += '<w:b w:val="1"/><w:bCs w:val="1"/>'
    } else {
      x = x.replace(/<w:b\b[^>]*\/?>/g, "").replace(/<w:bCs\b[^>]*\/?>/g, "")
    }
    return x ? `<w:rPr>${x}</w:rPr>` : ""
  }

  let xml = ""
  for (const seg of segments) {
    xml += openTag + rprXml(seg.bold) + `<w:t xml:space="preserve">${escapeXml(seg.text)}</w:t>` + closeR
  }
  if (tabs.length) {
    xml +=
      openTag +
      (baseInner ? `<w:rPr>${baseInner}</w:rPr>` : "") +
      tabs.join("") +
      closeR
  }
  return xml
}

function paragraphXmlFromTemplateLine(line: string, templateParaXml: string) {
  const openMatch = templateParaXml.match(/^<w:p\b[^>]*>/)
  const open = openMatch ? openMatch[0] : "<w:p>"
  const pprMatch = templateParaXml.match(/<w:pPr\b[^>]*>[\s\S]*?<\/w:pPr>/)
  const ppr = pprMatch ? pprMatch[0].replace(/<w:highlight\b[^>]*\/?>/g, "") : ""

  const segments = splitBoldSegments(line).filter((s) => s.text.length > 0)
  const runs =
    segments.length === 0
      ? ""
      : segments.length === 1 && !line.includes("**")
        ? `<w:r><w:t xml:space="preserve">${escapeXml(segments[0].text)}</w:t></w:r>`
        : segments
            .map((seg) => {
              const rpr = seg.bold ? '<w:rPr><w:b w:val="1"/><w:bCs w:val="1"/></w:rPr>' : ""
              return `<w:r>${rpr}<w:t xml:space="preserve">${escapeXml(seg.text)}</w:t></w:r>`
            })
            .join("")

  return `${open}${ppr}${runs}</w:p>`
}

/** Cada salto de línea del texto unificado = un `<w:p>` distinto; se reutiliza el estilo del párrafo HECHOS original en orden. */
function buildHechosParagraphs(
  userValue: string,
  anchorParaXml: string,
  paragraphTemplates?: string[],
) {
  const templates =
    paragraphTemplates && paragraphTemplates.length > 0 ? paragraphTemplates : [anchorParaXml]
  const lines = userValue.split(/\r?\n/g)
  return lines
    .map((line, i) => {
      const tpl = templates[Math.min(i, templates.length - 1)] ?? anchorParaXml
      return paragraphXmlFromTemplateLine(line, tpl)
    })
    .join("")
}

function patchDocumentXml(xml: string, model: DemandModel, values: Record<string, string>) {
  const paragraphs = model.paragraphs
  if (!paragraphs?.length) return xml

  const vals = values ?? {}
  const mergedFieldIds = new Set(model.mergedFieldIds ?? [])
  const mergedRaw = vals[MERGED_HECHOS_ID] ?? ""
  const mergedPruebaRaw = vals[MERGED_PRUEBA_TESTIMONIAL_ID] ?? ""

  let paraIdx = 0
  let groupIdx = 0

  const advanceParagraph = (paraXml: string) => {
    forEachFieldRunGroup(paraXml, () => {
      groupIdx++
    })
  }

  return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (paraXml) => {
    const info = paragraphs[paraIdx]
    paraIdx++

    if (!info) return paraXml

    if (info.hidden) {
      advanceParagraph(paraXml)
      return ""
    }

    if (info.mergedAnchor === MERGED_HECHOS_ID) {
      advanceParagraph(paraXml)
      const fallback = mergedRaw
      return buildHechosParagraphs(fallback, paraXml, model.hechosParagraphExportXml)
    }

    if (info.mergedAnchor === MERGED_PRUEBA_TESTIMONIAL_ID) {
      advanceParagraph(paraXml)
      return buildHechosParagraphs(
        mergedPruebaRaw,
        paraXml,
        model.pruebaTestimonialParagraphExportXml,
      )
    }

    const bumpFieldGroup = () => ++groupIdx
    return patchParagraphFieldRuns(paraXml, vals, mergedFieldIds, bumpFieldGroup)
  })
}

export function renderTemplate(content: string, jurisdiction: Jurisdiction, lawyer: LawyerProfile) {
  const safe = (v?: string) => (v ?? "").trim()
  const replacements: Record<string, string> = {
    "{{JURISDICCION}}": jurisdiction,
    "{{ABOGADO_NOMBRE}}": safe(lawyer.name),
    "{{ABOGADO_MATRICULA}}": safe(lawyer.enrollment),
    "{{ABOGADO_DIRECCION}}": safe(lawyer.address),
    "{{ABOGADO_EMAIL}}": safe(lawyer.email),
    "{{ABOGADO_TELEFONO}}": safe(lawyer.phone),
  }
  let out = content
  for (const [k, v] of Object.entries(replacements)) out = out.split(k).join(v)
  return out
}

export function renderFields(content: string, values: Record<string, string>) {
  let out = content
  for (const [id, value] of Object.entries(values)) {
    const token = `{{${id}}}`
    out = out.split(token).join(value ?? "")
  }
  return out
}

export async function exportModelToDocx(args: {
  model: DemandModel
  jurisdiction: Jurisdiction
  lawyer: LawyerProfile
  values: Record<string, string>
  /** Nombre base del archivo sin extensión (se agrega `.docx`). Por defecto: título + jurisdicción. */
  exportBaseName?: string
}) {
  const { model, jurisdiction, values } = args
  const rawBase = (args.exportBaseName?.trim() || `${model.title} - ${jurisdiction}`)
    .replace(/\.docx$/i, "")
    .trim()
  const safeBase = rawBase.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") || "demanda"
  const fileName = /\.docx$/i.test(safeBase) ? safeBase : `${safeBase}.docx`

  if (!model.sourceDocxB64) {
    throw new Error("Falta el .docx fuente para este modelo.")
  }

  const bytes = base64ToUint8Array(model.sourceDocxB64)
  const zip = await JSZip.loadAsync(bytes)
  const documentEntry = zip.file("word/document.xml")
  if (!documentEntry) throw new Error("El .docx fuente no contiene word/document.xml")
  const documentXml = await documentEntry.async("string")
  const patched = patchDocumentXml(documentXml, model, values ?? {})
  zip.file("word/document.xml", patched)

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })
  saveAs(blob, fileName)
}
