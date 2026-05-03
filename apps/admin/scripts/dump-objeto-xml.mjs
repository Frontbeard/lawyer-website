import fs from "fs"
import zlib from "zlib"

function readXml(docxPath) {
  const data = fs.readFileSync(docxPath)
  let eocdPos = -1
  for (let i = data.length - 22; i >= 0; i--) {
    if (data.readUInt32LE(i) === 0x06054b50) {
      eocdPos = i
      break
    }
  }
  const cdOffset = data.readUInt32LE(eocdPos + 16)
  let p = cdOffset
  const totalEntries = data.readUInt16LE(eocdPos + 10)
  for (let i = 0; i < totalEntries; i++) {
    const fnLen = data.readUInt16LE(p + 28)
    const name = data.slice(p + 46, p + 46 + fnLen).toString()
    if (name === "word/document.xml") {
      const lhOffset = data.readUInt32LE(p + 42)
      const lfFnLen = data.readUInt16LE(lhOffset + 26)
      const lfExLen = data.readUInt16LE(lhOffset + 28)
      const dataStart = lhOffset + 30 + lfFnLen + lfExLen
      const compSize = data.readUInt32LE(p + 20)
      const compMethod = data.readUInt16LE(p + 10)
      const compressed = data.slice(dataStart, dataStart + compSize)
      return compMethod === 8 ? zlib.inflateRawSync(compressed).toString("utf8") : compressed.toString("utf8")
    }
    const exLen = data.readUInt16LE(p + 30)
    const cmLen = data.readUInt16LE(p + 32)
    p += 46 + fnLen + exLen + cmLen
  }
  throw new Error("no doc")
}

function slicePara(xml, needle) {
  const i = xml.indexOf(needle)
  const start = xml.lastIndexOf("<w:p ", i)
  const end = xml.indexOf("</w:p>", i) + 6
  return xml.slice(start, end)
}

const base = "src/admin/templates/Buenos Aires"
const prov = readXml(`${base}/_DEMANDA ADM ACCIDENTE PROV MODELO - NUEVO BAREMO.docx`)
const rechazo = readXml(`${base}/DEMANDA RECHAZO PROV MODELO - NUEVO BAREMO.docx`)

console.log("=== PROV Objeto (competente por) ~2200 chars ===")
console.log(slicePara(prov, "competente por").slice(0, 2200))

const reBlock = slicePara(rechazo, "competente por")
console.log("\n=== RECHAZO Objeto len", reBlock.length, "===")
console.log(reBlock.slice(0, 2200))
console.log("--- tail ---\n", reBlock.slice(2200))
