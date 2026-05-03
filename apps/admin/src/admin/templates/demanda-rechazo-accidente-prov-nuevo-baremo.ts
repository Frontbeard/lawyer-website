import sourceB64 from "./demanda_rechazo_accidente_prov_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_rechazo_accidente_prov_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaRechazoAccidenteProvNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — rechazo por accidente (modelo PROV, Buenos Aires)",
)
