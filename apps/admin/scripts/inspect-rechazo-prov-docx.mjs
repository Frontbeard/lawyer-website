import fs from "fs"
import zlib from "zlib"

const docxPath = process.argv[2]
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
let xml = ""
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
    xml = compMethod === 8 ? zlib.inflateRawSync(compressed).toString("utf8") : compressed.toString("utf8")
    break
  }
  const exLen = data.readUInt16LE(p + 30)
  const cmLen = data.readUInt16LE(p + 32)
  p += 46 + fnLen + exLen + cmLen
}

function hlGroups(paraXml) {
  const runs = [...paraXml.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)]
  let g = 0,
    inG = false
  for (const m of runs) {
    const hl = m[1].match(/w:highlight[^>]*w:val="([^"]+)"/i)
    const isH = hl && (hl[1].toLowerCase() === "yellow" || hl[1].toLowerCase() === "green")
    if (isH) {
      if (!inG) {
        g++
        inG = true
      }
    } else {
      inG = false
    }
  }
  return { groups: g, runs: runs.length }
}

function slicePara(xml, needle) {
  const i = xml.indexOf(needle)
  if (i < 0) return null
  const start = xml.lastIndexOf("<w:p ", i)
  const end = xml.indexOf("</w:p>", i) + 6
  return xml.slice(start, end)
}

const obj = slicePara(xml, "competente por")
console.log("Objeto (competente por):", obj ? hlGroups(obj) : "NOT FOUND")

const sec = slicePara(xml, "A tales fines, y sin perjuicio")
console.log("\nA tales fines — tabs:", (sec?.match(/<w:tab/g) || []).length)
console.log("w:ind:", sec?.match(/<w:ind\b[^>]*\/?>/g))
if (sec) {
  const ppr = sec.match(/<w:pPr\b[^>]*>[\s\S]*?<\/w:pPr>/)?.[0] || ""
  console.log("pPr head:", ppr.slice(0, 450))
}
