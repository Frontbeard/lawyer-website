import type { TemplateField } from "../types"
import bodyB64 from "./rechazo_enf_prof_nuevo_baremo.body.b64?raw"
import fieldsTsv from "./rechazo_enf_prof_nuevo_baremo.fields.tsv?raw"

function decodeBase64Utf8(b64: string) {
  const cleaned = b64.replace(/\s+/g, "")
  const binary = atob(cleaned)
  // eslint-disable-next-line unicorn/prefer-code-point
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder("utf-8").decode(bytes)
}

function parseFields(tsv: string): TemplateField[] {
  return tsv
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, b64] = line.split("\t")
      const defaultValue = decodeBase64Utf8(b64 ?? "")
      const label = defaultValue.length > 80 ? `${defaultValue.slice(0, 77)}...` : defaultValue
      const input: TemplateField["input"] = defaultValue.length > 120 ? "textarea" : "text"
      return { id, label, defaultValue, input }
    })
}

export const rechazoEnfProfNuevoBaremo = {
  title: "Rechazo enfermedad profesional (nuevo baremo)",
  content: decodeBase64Utf8(bodyB64),
  fields: parseFields(fieldsTsv),
} as const

