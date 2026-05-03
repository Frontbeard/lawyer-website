// Extract a .docx into:
//   <slug>.source.b64   — the original .docx file as base64 (used for export-by-patching)
//   <slug>.layout.json  — structured paragraph data + field tokens (amarillo/verde = editable; verde ⇒ negrita al exportar)
//   <slug>.body.b64     — flat body text with {{FIELD_xxx}} tokens (legacy / fallback)
//   <slug>.fields.tsv   — id<TAB>base64 of original yellow text per field (legacy / fallback)
//
// Usage: node scripts/extract-docx.cjs "<path-to-docx>" "<slug>"

const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

function inflateRaw(buf) {
  return zlib.inflateRawSync(buf)
}

function readDocxXml(docxPath) {
  const data = fs.readFileSync(docxPath)
  let eocdPos = -1
  for (let i = data.length - 22; i >= 0; i--) {
    if (data.readUInt32LE(i) === 0x06054b50) {
      eocdPos = i
      break
    }
  }
  if (eocdPos < 0) throw new Error("EOCD not found")
  const totalEntries = data.readUInt16LE(eocdPos + 10)
  const cdOffset = data.readUInt32LE(eocdPos + 16)

  const entries = []
  let p = cdOffset
  for (let i = 0; i < totalEntries; i++) {
    if (data.readUInt32LE(p) !== 0x02014b50) throw new Error("bad central dir signature")
    const compMethod = data.readUInt16LE(p + 10)
    const compSize = data.readUInt32LE(p + 20)
    const fnLen = data.readUInt16LE(p + 28)
    const exLen = data.readUInt16LE(p + 30)
    const cmLen = data.readUInt16LE(p + 32)
    const lhOffset = data.readUInt32LE(p + 42)
    const name = data.slice(p + 46, p + 46 + fnLen).toString("utf8")
    entries.push({ name, compMethod, compSize, lhOffset })
    p += 46 + fnLen + exLen + cmLen
  }

  const target = entries.find((e) => e.name === "word/document.xml")
  if (!target) throw new Error("word/document.xml not found in docx")

  const lh = target.lhOffset
  if (data.readUInt32LE(lh) !== 0x04034b50) throw new Error("bad local header")
  const lfFnLen = data.readUInt16LE(lh + 26)
  const lfExLen = data.readUInt16LE(lh + 28)
  const dataStart = lh + 30 + lfFnLen + lfExLen
  const compressed = data.slice(dataStart, dataStart + target.compSize)
  if (target.compMethod === 0) return compressed.toString("utf8")
  if (target.compMethod === 8) return inflateRaw(compressed).toString("utf8")
  throw new Error("Unsupported compression method " + target.compMethod)
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
}

function parsePpr(pprXml) {
  // alignment
  const alignM = pprXml.match(/<w:jc\b[^>]*w:val="([^"]+)"/)
  const align = alignM ? alignM[1] : null

  // indent
  const indM = pprXml.match(/<w:ind\b[^>]*\/?>/)
  let indent = null
  if (indM) {
    const get = (k) => {
      const r = indM[0].match(new RegExp(`w:${k}="(-?\\d+)"`))
      return r ? Number(r[1]) : 0
    }
    indent = { left: get("left"), firstLine: get("firstLine"), hanging: get("hanging") }
  }

  // run-prop hints inside <w:rPr> within <w:pPr>
  const rprInPpr = pprXml.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
  const rprXml = rprInPpr ? rprInPpr[1] : ""
  const bold = /<w:b\b(?!\w)[^>]*\/?>/.test(rprXml)
  const italic = /<w:i\b(?!\w)[^>]*\/?>/.test(rprXml)
  const underline = /<w:u\b[^>]*w:val="(?!none)/.test(rprXml)
  const sizeM = rprXml.match(/<w:sz\b[^>]*w:val="(\d+)"/)
  const size = sizeM ? Number(sizeM[1]) : null

  return { align, indent, paraRunHints: { bold, italic, underline, size } }
}

function parseRprFlags(rprXml) {
  const bold = /<w:b\b(?!\w)[^>]*\/?>/.test(rprXml) && !/<w:b\b[^>]*w:val="(?:0|false)"/.test(rprXml)
  const italic = /<w:i\b(?!\w)[^>]*\/?>/.test(rprXml) && !/<w:i\b[^>]*w:val="(?:0|false)"/.test(rprXml)
  const underline = /<w:u\b[^>]*w:val="(?!none)/.test(rprXml)
  const sizeM = rprXml.match(/<w:sz\b[^>]*w:val="(\d+)"/)
  const size = sizeM ? Number(sizeM[1]) : null
  return { bold, italic, underline, size }
}

function runText(runInner) {
  let out = ""
  const re = /<w:(t|tab|br|cr)\b([^>]*)(?:\/>|>([\s\S]*?)<\/w:\1>)/g
  let m
  while ((m = re.exec(runInner)) !== null) {
    const tag = m[1]
    const inner = m[3] ?? ""
    if (tag === "t") out += decodeEntities(inner)
    else if (tag === "tab") out += "\t"
    else if (tag === "br" || tag === "cr") out += "\n"
  }
  return out
}

// Misma lógica que `docx.ts`: resaltado y sombreado amarillo/verde = editables.
const YELLOW_SHD_EX = new Set(["FFFF00", "FFE699", "FFF2CC", "FFFACD", "FFFF99", "FFEB9C"])
const GREEN_SHD_EX = new Set([
  "C6EFCE",
  "D9EAD3",
  "E2EFDA",
  "92D050",
  "00B050",
  "548235",
  "70AD47",
  "A8D08D",
])

function shdFillFromRpr(rpr) {
  const m = rpr.match(/<w:shd\b[^>]*w:fill="([^"]+)"/i)
  if (!m) return null
  const f = m[1].trim().toUpperCase()
  if (!f || f === "AUTO") return null
  return f.replace(/^#/, "")
}

function fillLooksYellowField(h) {
  if (YELLOW_SHD_EX.has(h)) return true
  if (h.length === 6 && /^[0-9A-F]+$/i.test(h)) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return r > 210 && g > 200 && b < 160
  }
  return false
}

function fillLooksGreenBold(h) {
  if (GREEN_SHD_EX.has(h)) return true
  if (fillLooksYellowField(h)) return false
  if (h.length === 6 && /^[0-9A-F]+$/i.test(h)) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return g >= 110 && g > r + 30 && g > b + 25
  }
  return false
}

/** Runs resaltados o sombreados (amarillo/verde) = contenido editable; verde ⇒ negrita al exportar. */
function runIsFieldHighlight(runInner) {
  const rprMatch = runInner.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
  if (!rprMatch) return false
  const rpr = rprMatch[1]
  const hl = rpr.match(/<w:highlight\b[^>]*w:val="([^"]+)"/i)
  if (hl) {
    const v = hl[1].toLowerCase()
    if (v === "yellow" || v === "darkyellow" || v === "green" || v === "darkgreen" || v === "lightgreen")
      return true
  }
  const fill = shdFillFromRpr(rpr)
  if (!fill) return false
  return fillLooksYellowField(fill) || fillLooksGreenBold(fill)
}

const ROMAN_RE = /^([IVX]+)\s*[–-]\s*(.+)/

function parseDocxXml(xml) {
  const paraRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g
  const runRe = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g
  const fields = []
  let counter = 0
  const paragraphs = []
  let currentSection = null
  let currentSectionTitle = null

  function nextFieldId() {
    counter++
    return "FIELD_" + String(counter).padStart(3, "0")
  }

  let pm
  while ((pm = paraRe.exec(xml)) !== null) {
    const inner = pm[1]
    const pprMatch = inner.match(/<w:pPr\b[^>]*>([\s\S]*?)<\/w:pPr>/)
    const ppr = pprMatch ? parsePpr(pprMatch[1]) : { align: null, indent: null, paraRunHints: {} }

    // walk runs in order
    const segs = []
    runRe.lastIndex = 0
    let rm
    let allBold = null
    while ((rm = runRe.exec(inner)) !== null) {
      const ri = rm[1]
      const text = runText(ri)
      const fieldHighlight = runIsFieldHighlight(ri)
      // Conservar runs vacíos si están en amarillo/verde: el export cuenta los mismos `<w:r>` en orden.
      if (!text && !fieldHighlight) continue
      const rprM = ri.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/)
      const rpr = parseRprFlags(rprM ? rprM[1] : "")
      segs.push({ text, fieldHighlight, ...rpr })
      allBold = allBold === null ? rpr.bold : allBold && rpr.bold
    }

    const tokens = []
    let lineText = ""
    let i = 0
    while (i < segs.length) {
      if (segs[i].fieldHighlight) {
        let j = i
        let buf = ""
        while (j < segs.length && segs[j].fieldHighlight) {
          buf += segs[j].text
          j++
        }
        const id = nextFieldId()
        fields.push({ id, text: buf })
        tokens.push({ type: "field", id })
        lineText += "{{" + id + "}}"
        i = j
      } else {
        if (segs[i].text) {
          tokens.push({ type: "text", value: segs[i].text })
          lineText += segs[i].text
        }
        i++
      }
    }

    // Section detection
    const trimmed = lineText.trim()
    const sectionMatch = trimmed.match(ROMAN_RE)
    let isSectionHeader = false
    if (sectionMatch && trimmed.length < 120) {
      currentSection = sectionMatch[1]
      currentSectionTitle = sectionMatch[2].trim()
      isSectionHeader = true
    }

    paragraphs.push({
      text: lineText,
      tokens,
      align: ppr.align,
      indent: ppr.indent,
      bold: allBold === true,
      italic: false,
      size: ppr.paraRunHints?.size ?? (segs[0]?.size ?? null),
      section: currentSection,
      isSectionHeader,
      sectionTitle: isSectionHeader ? currentSectionTitle : null,
      /** `<w:p>…</w:p>` original para conservar sangría/estilo al exportar HECHOS por líneas. */
      rawXml: pm[0],
    })
  }

  // Detect HECHOS section (any section whose title contains "HECHOS")
  let hechosSection = null
  for (const p of paragraphs) {
    if (p.isSectionHeader && p.sectionTitle && /HECHOS/i.test(p.sectionTitle)) {
      hechosSection = p.section
      break
    }
  }

  return { paragraphs, fields, hechosSection }
}

function main() {
  const [, , docxPath, slug] = process.argv
  if (!docxPath || !slug) {
    console.error("Usage: node scripts/extract-docx.cjs <docx> <slug>")
    process.exit(1)
  }

  const xml = readDocxXml(docxPath)
  const { paragraphs, fields, hechosSection } = parseDocxXml(xml)

  const outDir = path.join(__dirname, "..", "src", "admin", "templates")
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // 1. Source .docx as base64 (for export-by-patching)
  const docxBytes = fs.readFileSync(docxPath)
  fs.writeFileSync(path.join(outDir, slug + ".source.b64"), docxBytes.toString("base64"))

  // 2. Layout JSON
  const layout = { hechosSection, paragraphs, fields }
  fs.writeFileSync(path.join(outDir, slug + ".layout.json"), JSON.stringify(layout))

  console.log("Wrote", slug, "—", paragraphs.length, "paragraphs,", fields.length, "fields")
  console.log("  HECHOS section:", hechosSection)
  console.log("  source.b64:", docxBytes.length, "bytes")
}

main()
