import sourceB64 from "./demanda_adm_rechazo_querato_caba_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_adm_rechazo_querato_caba_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaAdmRechazoQueratoCabaNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — rechazo por queratopatía (CABA)",
)
