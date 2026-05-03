import type { DemandModel, DemandTemplateState, Jurisdiction, LawyerProfile } from "./types"
import { seedState } from "./seed"

const STORAGE_KEY = "mr_admin_templates_v1"
const FIELD_VALUES_KEY = "mr_admin_field_values_v1"

function readAllFieldValues(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(FIELD_VALUES_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, Record<string, string>>
  } catch {
    return {}
  }
}

export function loadFieldValues(modelId: string): Record<string, string> {
  return readAllFieldValues()[modelId] ?? {}
}

export function saveFieldValues(modelId: string, values: Record<string, string>) {
  const all = readAllFieldValues()
  all[modelId] = values
  localStorage.setItem(FIELD_VALUES_KEY, JSON.stringify(all))
}

export function clearFieldValues(modelId: string) {
  const all = readAllFieldValues()
  delete all[modelId]
  localStorage.setItem(FIELD_VALUES_KEY, JSON.stringify(all))
}

/** Reemplaza modelos por el catálogo del seed (p. ej. vacío) y conserva abogados. */
function migrateTemplatesKeepLawyers(parsed: DemandTemplateState): DemandTemplateState {
  const fresh = seedState()
  return {
    ...fresh,
    lawyers: parsed.lawyers,
  }
}

export function loadState(): DemandTemplateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as DemandTemplateState
    if (!parsed || typeof parsed.version !== "number") return seedState()
    if (!parsed.lawyers?.CABA || !parsed.lawyers?.PBA) return seedState()
    if (!Array.isArray(parsed.models)) return seedState()
    if (parsed.version < 26) {
      const next = migrateTemplatesKeepLawyers(parsed)
      saveState(next)
      return next
    }
    return parsed
  } catch {
    return seedState()
  }
}

export function saveState(state: DemandTemplateState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function upsertLawyer(state: DemandTemplateState, jurisdiction: Jurisdiction, lawyer: LawyerProfile): DemandTemplateState {
  const next = {
    ...state,
    lawyers: {
      ...state.lawyers,
      [jurisdiction]: lawyer,
    },
  }
  saveState(next)
  return next
}

export function updateModelContent(
  state: DemandTemplateState,
  jurisdiction: Jurisdiction,
  modelId: string,
  patch: Pick<DemandModel, "content" | "title">,
): DemandTemplateState {
  const updatedAt = new Date().toISOString()
  const nextModels = state.models.map((m) => {
    if (m.jurisdiction !== jurisdiction || m.id !== modelId) return m
    return { ...m, ...patch, updatedAt }
  })
  const next = { ...state, models: nextModels }
  saveState(next)
  return next
}

export function updateModelFields(
  state: DemandTemplateState,
  jurisdiction: Jurisdiction,
  modelId: string,
  fields: DemandModel["fields"],
): DemandTemplateState {
  const updatedAt = new Date().toISOString()
  const nextModels = state.models.map((m) => {
    if (m.jurisdiction !== jurisdiction || m.id !== modelId) return m
    return { ...m, fields, updatedAt }
  })
  const next = { ...state, models: nextModels }
  saveState(next)
  return next
}

