import sourceB64 from "./demanda_rechazo_caba_modelo_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_rechazo_caba_modelo_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaRechazoCabaModeloNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — rechazo (modelo CABA)",
)
