/**
 * En el modelo LOE, el párrafo Objeto tenía amarillo+verde+amarillo seguidos sin texto sin resaltar
 * entre medio → el extractor une todo en un solo FIELD. La demanda PROV estándar inserta runs
 * sin resaltar (" contra ", "., con domicilio en") entre trozos → 3 campos separados en la app.
 * Este script reescribe ese párrafo en document.xml para igualar ese patrón.
 */
import fs from "fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import JSZip from "jszip"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docxPath = path.join(
  __dirname,
  "../src/admin/templates/Buenos Aires/DEMANDA ADM PROV MODELO ACCIDENTE LESION OCULAR - NUEVO BAREMO.docx",
)

const zip = await JSZip.loadAsync(fs.readFileSync(docxPath))
const entry = zip.file("word/document.xml")
if (!entry) throw new Error("missing document.xml")
let xml = await entry.async("string")

const needle =
  '<w:t xml:space="preserve">la ubicación del lugar de prestación de servicios, contra </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:b w:val="1"/><w:bCs w:val="1"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="green"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">ANDINA ART S.A., CUIT 33716992999</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">, con domicilio en la calle Av. Belgrano 672, CABA,</w:t>'

const replacement =
  '<w:t xml:space="preserve">la ubicación del lugar de prestación de servicios,</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve"> contra </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:b w:val="1"/><w:bCs w:val="1"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="green"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">ANDINA ART S.A., CUIT 33716992999</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">, con domicilio en</w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rFonts w:ascii="Microsoft New Tai Lue" w:cs="Microsoft New Tai Lue" w:eastAsia="Microsoft New Tai Lue" w:hAnsi="Microsoft New Tai Lue"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:highlight w:val="yellow"/><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve"> la calle Av. Belgrano 672, CABA,</w:t>'

if (!xml.includes(needle)) {
  console.error("Patrón Objeto LOE no encontrado — ¿ya estaba partido o cambió el .docx?")
  process.exit(1)
}

xml = xml.replace(needle, replacement)
zip.file("word/document.xml", xml)
const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
fs.writeFileSync(docxPath, out)
console.log("OK:", docxPath)
