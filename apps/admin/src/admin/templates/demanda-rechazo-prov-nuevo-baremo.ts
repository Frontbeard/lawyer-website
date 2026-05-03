import sourceB64 from "./demanda_rechazo_prov_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_rechazo_prov_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaRechazoProvNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — rechazo (modelo PROV, Buenos Aires)",
)
