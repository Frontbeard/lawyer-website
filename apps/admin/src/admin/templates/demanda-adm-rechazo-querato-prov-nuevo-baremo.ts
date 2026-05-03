import sourceB64 from "./demanda_adm_rechazo_querato_prov_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_adm_rechazo_querato_prov_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaAdmRechazoQueratoProvNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — rechazo por queratopatía (Buenos Aires)",
)
