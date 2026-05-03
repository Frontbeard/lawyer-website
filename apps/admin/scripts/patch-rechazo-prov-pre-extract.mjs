/**
 * Antes de extract-docx sobre DEMANDA RECHAZO PROV MODELO:
 * 1) Objeto: entre run verde (ART) y amarillo (domicilio) inserta texto sin resaltar
 *    ", con domicilio legal en " para que sean 3 campos como PROV estándar.
 * 2) "A tales fines…": quita highlight del w:pPr; reemplaza espacios iniciales por dos tabs como los otros modelos.
 */
import fs from "fs"
import path from "node:path"
import JSZip from "jszip"

const docxPath = path.join(
  process.cwd(),
  "src/admin/templates/Buenos Aires/DEMANDA RECHAZO PROV MODELO - NUEVO BAREMO.docx",
)

const zip = await JSZip.loadAsync(fs.readFileSync(docxPath))
let xml = await zip.file("word/document.xml").async("string")

const objetoOld =
  `<w:t xml:space="preserve">ASOCIART SA ASEGURADORA DE RIESGOS DEL TRABAJO CUIT: 30686273330</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">, con domicilio legal en Leandro N. Alem 621, Ciudad Autónoma de Buenos Aires</w:t></w:r>`

const objetoNew =
  `<w:t xml:space="preserve">ASOCIART SA ASEGURADORA DE RIESGOS DEL TRABAJO CUIT: 30686273330</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">, con domicilio legal en </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">Leandro N. Alem 621, Ciudad Autónoma de Buenos Aires</w:t></w:r>`

const talesOld =
  `<w:pPr><w:spacing w:after="0" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">                      </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve"> A tales fines,`

const talesNew =
  `<w:pPr><w:spacing w:after="0" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:pPr><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:tab/><w:tab/></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve"> A tales fines,`

let ok = true
if (!xml.includes(objetoOld)) {
  console.warn("Objeto: patrón no encontrado (¿ya parcheado o ART distinto?)")
  ok = false
} else {
  xml = xml.replace(objetoOld, objetoNew)
  console.log("Objeto: OK")
}

if (!xml.includes(talesOld)) {
  console.warn("A tales fines: patrón no encontrado")
  ok = false
} else {
  xml = xml.replace(talesOld, talesNew)
  console.log("A tales fines: OK")
}

if (!ok) process.exit(1)

zip.file("word/document.xml", xml)
const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
fs.writeFileSync(docxPath, out)
console.log("Escrito:", docxPath)
