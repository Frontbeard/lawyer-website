import sourceB64 from "./demanda_adm_accidente_caba_nuevo_baremo.source.b64?raw"
import layoutJson from "./demanda_adm_accidente_caba_nuevo_baremo.layout.json?raw"
import { buildTemplate } from "./_loader"

export const demandaAdmAccidenteCabaNuevoBaremo = buildTemplate(
  sourceB64,
  layoutJson,
  "Demanda administrativa — accidente de trabajo (CABA)",
)
