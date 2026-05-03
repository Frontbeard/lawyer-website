/**
 * Alinea el párrafo "Las secuelas…" del modelo querato PROV con PROV estándar:
 * quita sangría OOXML (w:ind firstLine) y el highlight en w:pPr; inserta dos tabs como runs aparte.
 */
import fs from "fs"
import path from "node:path"
import JSZip from "jszip"

const docxPath = path.join(
  process.cwd(),
  "src/admin/templates/Buenos Aires/DEMANDA ADM RECHAZO QUERATO PROV - NUEVO BAREMO.docx",
)

const zip = await JSZip.loadAsync(fs.readFileSync(docxPath))
let xml = await zip.file("word/document.xml").async("string")

const oldPrefix =
  `<w:pPr><w:spacing w:after="0" w:lineRule="auto"/><w:ind w:firstLine="1440"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">Las secuelas descriptas`

const newPrefix =
  `<w:pPr><w:spacing w:after="0" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:tab/><w:tab/></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">Las secuelas descriptas`

if (!xml.includes(oldPrefix)) {
  console.error("Patrón Las secuelas (querato) no encontrado — revisá si el .docx cambió.")
  process.exit(1)
}

xml = xml.replace(oldPrefix, newPrefix)
zip.file("word/document.xml", xml)
const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
fs.writeFileSync(docxPath, out)
console.log("OK:", docxPath)
