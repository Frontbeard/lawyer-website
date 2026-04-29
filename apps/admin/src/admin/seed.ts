import type { DemandModel, DemandTemplateState } from "./types"
import { rechazoEnfProfNuevoBaremo } from "./templates/rechazo-enf-prof-nuevo-baremo"

function nowIso() {
  return new Date().toISOString()
}

function baseContent(title: string) {
  return [
    title.toUpperCase(),
    "",
    "Jurisdicción: {{JURISDICCION}}",
    "Abogado/a: {{ABOGADO_NOMBRE}}",
    "{{ABOGADO_MATRICULA}}",
    "{{ABOGADO_DIRECCION}}",
    "{{ABOGADO_EMAIL}}",
    "{{ABOGADO_TELEFONO}}",
    "",
    "—",
    "",
    "Hechos:",
    "- (completar)",
    "",
    "Derecho:",
    "- (completar)",
    "",
    "Petitorio:",
    "- (completar)",
    "",
    "Firma",
    "{{ABOGADO_NOMBRE}}",
  ].join("\n")
}

function model(jurisdiction: DemandModel["jurisdiction"], key: DemandModel["key"], title: string): DemandModel {
  return {
    id: `${jurisdiction}:${key}`,
    jurisdiction,
    key,
    title,
    content: baseContent(title),
    updatedAt: nowIso(),
  }
}

function modelWithTemplate(
  jurisdiction: DemandModel["jurisdiction"],
  key: DemandModel["key"],
  title: string,
): DemandModel {
  return {
    id: `${jurisdiction}:${key}`,
    jurisdiction,
    key,
    title,
    content: rechazoEnfProfNuevoBaremo.content,
    fields: rechazoEnfProfNuevoBaremo.fields,
    updatedAt: nowIso(),
  }
}

export function seedState(): DemandTemplateState {
  return {
    version: 1,
    lawyers: {
      CABA: {
        name: "Ramiro (CABA)",
        email: "",
        phone: "",
        address: "",
        enrollment: "",
      },
      PBA: {
        name: "Federico (Provincia de Buenos Aires)",
        email: "",
        phone: "",
        address: "",
        enrollment: "",
      },
    },
    models: [
      model("CABA", "accidente_trabajo", "Accidente de trabajo"),
      model("CABA", "enfermedad_profesional", "Enfermedad profesional"),
      modelWithTemplate("CABA", "rechazo_enfermedad_profesional", "Rechazo por enfermedad profesional"),
      model("CABA", "rechazo_accidente_trabajo", "Rechazo de accidente de trabajo"),
      model("CABA", "accidente_trabajo_lesion_ocular", "Accidente de trabajo (lesión ocular)"),
      model("CABA", "queratoconjuntivitis", "Queratoconjuntivitis (enfermedad profesional)"),
      model("PBA", "accidente_trabajo", "Accidente de trabajo"),
      model("PBA", "enfermedad_profesional", "Enfermedad profesional"),
      modelWithTemplate("PBA", "rechazo_enfermedad_profesional", "Rechazo por enfermedad profesional"),
      model("PBA", "rechazo_accidente_trabajo", "Rechazo de accidente de trabajo"),
      model("PBA", "accidente_trabajo_lesion_ocular", "Accidente de trabajo (lesión ocular)"),
      model("PBA", "queratoconjuntivitis", "Queratoconjuntivitis (enfermedad profesional)"),
    ],
  }
}

