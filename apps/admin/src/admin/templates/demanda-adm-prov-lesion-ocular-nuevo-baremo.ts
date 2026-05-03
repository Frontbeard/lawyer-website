import sourceB64 from "./demanda_adm_prov_lesion_ocular_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_adm_prov_lesion_ocular_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaAdmProvLesionOcularNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — lesión ocular (Buenos Aires)",
)
