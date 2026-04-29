import { Packer, Paragraph, TextRun, Document } from "docx"
import { saveAs } from "file-saver"
import type { DemandModel, Jurisdiction, LawyerProfile } from "./types"

function safe(v?: string) {
  return (v ?? "").trim()
}

export function renderTemplate(content: string, jurisdiction: Jurisdiction, lawyer: LawyerProfile) {
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

export async function exportModelToDocx(args: { model: DemandModel; jurisdiction: Jurisdiction; lawyer: LawyerProfile }) {
  const rendered = renderTemplate(args.model.content, args.jurisdiction, args.lawyer)
  const lines = rendered.split(/\r?\n/g)

  const doc = new Document({
    sections: [
      {
        children: lines.map((line) => {
          if (!line.trim()) return new Paragraph({ children: [new TextRun("")] })
          return new Paragraph({ children: [new TextRun(line)] })
        }),
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safeTitle = args.model.title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
  saveAs(blob, `${safeTitle} - ${args.jurisdiction}.docx`)
}

