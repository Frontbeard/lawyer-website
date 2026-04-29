import type { DemandModel, DemandTemplateState, Jurisdiction, LawyerProfile } from "./types"
import { seedState } from "./seed"

const STORAGE_KEY = "mr_admin_templates_v1"

export function loadState(): DemandTemplateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as DemandTemplateState
    if (!parsed || parsed.version !== 1) return seedState()
    if (!parsed.models?.length) return seedState()
    if (!parsed.lawyers?.CABA || !parsed.lawyers?.PBA) return seedState()
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

