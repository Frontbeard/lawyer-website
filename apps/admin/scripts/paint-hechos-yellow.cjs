// Pone resaltado amarillo en todos los <w:r> con texto de un párrafo que coincida con marcadores.
// Uso: node scripts/paint-hechos-yellow.cjs "<ruta.docx>"
//
// Sin esto, el extractor no genera FIELD_* y el export no reemplaza texto (solo parchea runs amarillos).

const fs = require("fs")
const path = require("path")
const JSZip = require("jszip")

/** Párrafos que deben ser totalmente editables (texto característico al inicio). */
const MARKERS = [
  "Lo cierto es que la ART, en el afán de reducir",
  "El alta médica fue otorgada sin haberse agotado",
  "En efecto, puede afirmarse que como consecuencia del accidente",
]

function stripXmlText(xml) {
  return xml
    .replace(/<w:tab\b[^>]*\/?>/g, "\t")
    .replace(/<w:(?:br|cr)\b[^>]*\/?>/g, "\n")
    .replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, (_, t) => t.replace(/<[^>]+>/g, ""))
    .replace(/<[^>]+>/g, "")
}

function addYellowToRuns(paraXml) {
  return paraXml.replace(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g, (full, inner) => {
    if (!/<w:t\b/.test(inner)) return full
    if (/w:highlight\b[^>]*w:val="yellow"/i.test(inner)) return full
    const openMatch = full.match(/^<w:r\b[^>]*>/)
    const openTag = openMatch ? openMatch[0] : "<w:r>"
    const rprMatch = inner.match(/^(<w:rPr\b[^>]*>)([\s\S]*)(<\/w:rPr>)/)
    if (rprMatch) {
      const innerRest = inner.slice(rprMatch[0].length)
      const newRpr = rprMatch[1] + "<w:highlight w:val=\"yellow\"/>" + rprMatch[2] + rprMatch[3]
      return openTag + newRpr + innerRest + "</w:r>"
    }
    return openTag + "<w:rPr><w:highlight w:val=\"yellow\"/></w:rPr>" + inner + "</w:r>"
  })
}

function patchDocumentXml(xml) {
  const paraRe = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g
  return xml.replace(paraRe, (paraXml) => {
    const plain = stripXmlText(paraXml)
    const hit = MARKERS.some((m) => plain.includes(m))
    if (!hit) return paraXml
    return addYellowToRuns(paraXml)
  })
}

async function main() {
  const docxPath = process.argv[2]
  if (!docxPath) {
    console.error("Usage: node scripts/paint-hechos-yellow.cjs <path-to.docx>")
    process.exit(1)
  }
  const buf = fs.readFileSync(docxPath)
  const zip = await JSZip.loadAsync(buf)
  const entry = zip.file("word/document.xml")
  if (!entry) throw new Error("word/document.xml not found")
  let xml = await entry.async("string")
  xml = patchDocumentXml(xml)
  zip.file("word/document.xml", xml)
  const out = await zip.generateAsync({ type: "nodebuffer" })
  fs.writeFileSync(docxPath, out)
  console.log("Updated yellow highlight in:", path.resolve(docxPath))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
