import type { DemandModel, DemandTemplateState, Jurisdiction } from "./types"
import type { LoadedTemplate } from "./templates/_loader"
import { demandaAdmProvLesionOcularNuevoBaremo } from "./templates/demanda-adm-prov-lesion-ocular-nuevo-baremo"
import { demandaAdmProvNuevoBaremo } from "./templates/demanda-adm-prov-nuevo-baremo"
import { demandaAdmRechazoQueratoProvNuevoBaremo } from "./templates/demanda-adm-rechazo-querato-prov-nuevo-baremo"
import { demandaRechazoAccidenteProvNuevoBaremo } from "./templates/demanda-rechazo-accidente-prov-nuevo-baremo"
import { demandaAdmAccidenteCabaNuevoBaremo } from "./templates/demanda-adm-accidente-caba-nuevo-baremo"
import { demandaAdmCabaLesionOcularNuevoBaremo } from "./templates/demanda-adm-caba-lesion-ocular-nuevo-baremo"
import { demandaAdmRechazoQueratoCabaNuevoBaremo } from "./templates/demanda-adm-rechazo-querato-caba-nuevo-baremo"
import { demandaRechazoCabaModeloNuevoBaremo } from "./templates/demanda-rechazo-caba-modelo-nuevo-baremo"
import { demandaRechazoAccidenteCabaNuevoBaremo } from "./templates/demanda-rechazo-accidente-caba-nuevo-baremo"
import { demandaRechazoProvNuevoBaremo } from "./templates/demanda-rechazo-prov-nuevo-baremo"

function nowIso() {
  return new Date().toISOString()
}

function model(
  jurisdiction: Jurisdiction,
  key: DemandModel["key"],
  title: string,
  template: LoadedTemplate,
): DemandModel {
  return {
    id: `${jurisdiction}:${key}`,
    jurisdiction,
    key,
    title,
    content: template.content,
    paragraphs: template.paragraphs,
    sourceDocxB64: template.sourceDocxB64,
    fields: template.fields,
    mergedFieldIds: template.mergedFieldIds,
    hechosParagraphExportXml: template.hechosParagraphExportXml,
    pruebaTestimonialParagraphExportXml: template.pruebaTestimonialParagraphExportXml,
    updatedAt: nowIso(),
  }
}

export function seedState(): DemandTemplateState {
  return {
    version: 28,
    lawyers: {
      CABA: { name: "Dra. Renó", email: "", phone: "", address: "", enrollment: "" },
      PBA: { name: "Dra. Renó", email: "", phone: "", address: "", enrollment: "" },
    },
    models: [
      model(
        "PBA",
        "accidente_trabajo",
        "Demanda administrativa — accidente de trabajo (Buenos Aires)",
        demandaAdmProvNuevoBaremo,
      ),
      model(
        "PBA",
        "accidente_trabajo_lesion_ocular",
        "Demanda administrativa — lesión ocular (Buenos Aires)",
        demandaAdmProvLesionOcularNuevoBaremo,
      ),
      model(
        "PBA",
        "rechazo_querato",
        "Demanda administrativa — rechazo por queratopatía (Buenos Aires)",
        demandaAdmRechazoQueratoProvNuevoBaremo,
      ),
      model(
        "PBA",
        "rechazo_prov",
        "Demanda administrativa — rechazo (modelo PROV, Buenos Aires)",
        demandaRechazoProvNuevoBaremo,
      ),
      model(
        "PBA",
        "rechazo_accidente_prov",
        "Demanda administrativa — rechazo por accidente (modelo PROV, Buenos Aires)",
        demandaRechazoAccidenteProvNuevoBaremo,
      ),
      model(
        "CABA",
        "accidente_trabajo",
        "Demanda administrativa — accidente de trabajo (CABA)",
        demandaAdmAccidenteCabaNuevoBaremo,
      ),
      model(
        "CABA",
        "accidente_trabajo_lesion_ocular",
        "Demanda administrativa — lesión ocular (CABA)",
        demandaAdmCabaLesionOcularNuevoBaremo,
      ),
      model(
        "CABA",
        "rechazo_querato",
        "Demanda administrativa — rechazo por queratopatía (CABA)",
        demandaAdmRechazoQueratoCabaNuevoBaremo,
      ),
      model(
        "CABA",
        "rechazo_caba",
        "Demanda administrativa — rechazo (modelo CABA)",
        demandaRechazoCabaModeloNuevoBaremo,
      ),
      model(
        "CABA",
        "rechazo_accidente_caba",
        "Demanda administrativa — rechazo por accidente (modelo CABA)",
        demandaRechazoAccidenteCabaNuevoBaremo,
      ),
    ],
  }
}
