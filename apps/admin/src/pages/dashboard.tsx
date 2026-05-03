import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { toast } from "sonner"
import { MRLogo } from "../components/mr-logo"
import { useTheme } from "../components/theme-provider"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import type {
  DemandModel,
  Jurisdiction,
  LawyerProfile,
  ParagraphInfo,
  TemplateField,
} from "../admin/types"
import {
  clearFieldValues,
  loadFieldValues,
  loadState,
  saveFieldValues,
  upsertLawyer,
} from "../admin/storage"
import { exportModelToDocx } from "../admin/docx"
import { logout } from "../admin/auth"

/** Tipografía cercana a Word (Windows): Cambria / Times New Roman */
const WORD_PAGE_FONT = 'Cambria, "Times New Roman", "Times", "Liberation Serif", serif'

function twipsToPx(tw: number): string {
  if (!tw) return "0"
  return `${(tw / 1440) * 96}px`
}

/** En vista previa, sangría de bloque (textarea/merged) no puede superar ~88px o el campo queda en una tira (p. ej. «Las secuelas descriptas»). El .docx exportado conserva el XML original. */
function twipsToPxBlockPreview(tw: number): string {
  if (!tw) return "0"
  const px = (tw / 1440) * 96
  return `${Math.min(px, 88)}px`
}

function paragraphIndentStyle(p: ParagraphInfo): React.CSSProperties | undefined {
  const ind = p.indent
  if (!ind) return undefined
  const s: React.CSSProperties = {}
  const onlyBlockField =
    p.tokens.length === 1 && (p.tokens[0].type === "field" || p.tokens[0].type === "merged")

  if (ind.left) s.paddingLeft = twipsToPx(ind.left)
  if (ind.hanging && ind.hanging > 0) {
    s.paddingLeft = twipsToPx((ind.left ?? 0) + ind.hanging)
    s.textIndent = twipsToPx(-ind.hanging)
  } else if (ind.firstLine) {
    // Sangría solo de primera línea: en Word funciona con texto corrido. Si el párrafo es solo un
    // campo en bloque (textarea), `text-indent` en el <p> desplaza mal el cuadro (se ve angosto y corrido).
    if (onlyBlockField) {
      s.paddingLeft = twipsToPxBlockPreview((ind.left ?? 0) + ind.firstLine)
    } else {
      s.textIndent = twipsToPx(ind.firstLine)
    }
  }
  return Object.keys(s).length ? s : undefined
}

/** Quita tabs/espacios previos a un campo bloque y los vuelve padding en el contenedor (evita un «renglón» raro con tabs + textarea). */
function stripLeadingWhitespaceBeforeBlockField(
  parts: Array<{ type: "text"; value: string } | { type: "field"; id: string }>,
  fieldById: Map<string, TemplateField>,
): {
  parts: Array<{ type: "text"; value: string } | { type: "field"; id: string }>
  blockLeadPadding?: string
} {
  if (parts.length < 2) return { parts }
  const a = parts[0]
  const b = parts[1]
  if (a.type !== "text" || b.type !== "field") return { parts }
  if (!/^[\t ]+$/.test(a.value)) return { parts }
  const f = fieldById.get(b.id)
  if (!f || (f.input !== "textarea" && f.input !== "merged")) return { parts }
  const tabs = (a.value.match(/\t/g) || []).length
  const spaces = (a.value.match(/ /g) || []).length
  const ch = tabs * 1.75 + spaces * 0.25
  return {
    parts: parts.slice(1),
    blockLeadPadding: ch > 0 ? `${Math.min(ch, 12)}ch` : undefined,
  }
}

function alignClassFromPara(a: ParagraphInfo["align"]): string {
  if (a === "center") return "text-center"
  if (a === "right") return "text-right"
  if (a === "both") return "text-justify"
  return "text-left"
}

function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return iso
  }
}

function countFilled(fields: TemplateField[] | undefined, values: Record<string, string>) {
  if (!fields?.length) return { filled: 0, total: 0 }
  let filled = 0
  for (const f of fields) if ((values[f.id] ?? "").trim()) filled++
  return { filled, total: fields.length }
}

function classifyParagraph(line: string) {
  const trimmed = line.trim()
  if (!trimmed) return "empty"
  if (/^[IVX]+\s*[–-]\s*[A-ZÁÉÍÓÚÑ]/.test(trimmed)) return "section"
  if (/^[A-ZÁÉÍÓÚÑ0-9\s.,–\-]{6,}$/.test(trimmed) && trimmed.length < 90 && /\s/.test(trimmed)) return "title"
  return "para"
}

function leadingTabs(line: string) {
  let n = 0
  while (line[n] === "\t") n++
  return n
}

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100)
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="h-2 w-full min-w-0 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/90 via-primary to-primary/70 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
        {filled} / {total} campos
      </span>
    </div>
  )
}

function jurisdictionShortLabel(j: Jurisdiction): string {
  return j === "PBA" ? "Buenos Aires" : "CABA"
}

function AdminThemeToggle() {
  const { setTheme } = useTheme()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.classList.contains("dark"))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0 rounded-full border-border shrink-0 bg-card"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <Sun className="h-4 w-4" strokeWidth={2} /> : <Moon className="h-4 w-4" strokeWidth={2} />}
    </Button>
  )
}

function JurisdictionToggle({
  value,
  onChange,
}: {
  value: Jurisdiction
  onChange: (v: Jurisdiction) => void
}) {
  return (
    <div className="inline-flex max-w-full rounded-full border border-border bg-muted/40 p-1 shadow-sm backdrop-blur-sm">
      {(["CABA", "PBA"] as Jurisdiction[]).map((j) => (
        <button
          key={j}
          type="button"
          onClick={() => onChange(j)}
          className={[
            "px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors min-w-0 sm:min-w-[7rem] sm:px-4 sm:text-sm",
            value === j
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {j === "CABA" ? "CABA" : "Buenos Aires"}
        </button>
      ))}
    </div>
  )
}

function ModelList({
  models,
  selectedId,
  onSelect,
  fieldValuesByModel,
}: {
  models: DemandModel[]
  selectedId: string
  onSelect: (id: string) => void
  fieldValuesByModel: Record<string, Record<string, string>>
}) {
  return (
    <div className="space-y-1">
      {models.map((m) => {
        const values = fieldValuesByModel[m.id] ?? {}
        const { filled, total } = countFilled(m.fields, values)
        const isSelected = selectedId === m.id
        const isTemplate = total > 0
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={[
              "w-full text-left rounded-xl px-3 py-2.5 transition-colors border",
              isSelected
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card/80 border-transparent hover:border-border hover:bg-muted/60 text-card-foreground",
            ].join(" ")}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight truncate">{m.title}</div>
                <div
                  className={[
                    "text-[11px] mt-1",
                    isSelected ? "text-background/80" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {isTemplate ? `${filled} / ${total} completados` : "Plantilla genérica"}
                </div>
              </div>
              {isTemplate ? (
                <span
                  className={[
                    "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md",
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-primary/30 text-foreground dark:bg-primary/40",
                  ].join(" ")}
                >
                  Lista
                </span>
              ) : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}

const tokenReGlobal = /\{\{([A-Za-z0-9_]+)\}\}/g

function parseLineTokens(trimmed: string) {
  const parts: Array<{ type: "text"; value: string } | { type: "field"; id: string }> = []
  let last = 0
  tokenReGlobal.lastIndex = 0
  for (const m of trimmed.matchAll(tokenReGlobal)) {
    const start = m.index ?? 0
    const id = m[1]
    if (start > last) parts.push({ type: "text", value: trimmed.slice(last, start) })
    parts.push({ type: "field", id })
    last = start + m[0].length
  }
  if (last < trimmed.length) parts.push({ type: "text", value: trimmed.slice(last) })
  return parts
}

/** Usa los tokens del layout (extractor) para no perder tabs / orden frente a parseLineTokens(trimmed). */
function partsFromParagraphTokens(para: ParagraphInfo): Array<
  { type: "text"; value: string } | { type: "field"; id: string }
> {
  return para.tokens.map((t) => {
    if (t.type === "text") return { type: "text", value: t.value }
    if (t.type === "field") return { type: "field", id: t.id }
    return { type: "field", id: t.id }
  })
}

function DocumentPaper({
  content,
  paragraphs,
  fields,
  values,
  onChange,
  inputRefs,
}: {
  content: string
  paragraphs?: ParagraphInfo[]
  fields: TemplateField[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>
}) {
  const fieldById = useMemo(() => new Map(fields.map((f) => [f.id, f])), [fields])

  const visibleParagraphs = useMemo(
    () => paragraphs?.filter((p) => !p.hidden) ?? null,
    [paragraphs],
  )

  const linesFallback = useMemo(() => content.split(/\r?\n/g), [content])

  const renderFieldParts = (
    parts: Array<{ type: "text"; value: string } | { type: "field"; id: string }>,
    keyPrefix: string,
    inheritFontSize?: string,
    /** Sangría por tabs previos al campo (evita tabs sueltos en línea aparte). */
    blockLeadPaddingFirst?: string,
  ) => {
    let appliedBlockLead = false
    return parts.map((p, pIdx) => {
      if (p.type === "text")
        return (
          <span
            key={`${keyPrefix}-t-${pIdx}`}
            className={p.value.includes("\t") ? "whitespace-pre-wrap" : undefined}
          >
            {p.value}
          </span>
        )

      const f = fieldById.get(p.id)
      const v = values[p.id] ?? ""

      if (!f) {
        return (
          <span key={`${keyPrefix}-u-${pIdx}`} className="bg-[#fff2cc] px-0.5 rounded-sm border border-amber-300/60">
            {v}
          </span>
        )
      }

      const filled = v.trim().length > 0
      const fontStyle = { fontFamily: WORD_PAGE_FONT, fontSize: inheritFontSize }

      if (f.input === "textarea" || f.input === "merged") {
        const rows =
          f.input === "merged"
            ? Math.max(10, Math.ceil(f.defaultValue.length / 72))
            : Math.max(4, Math.ceil(f.defaultValue.length / 72))
        const lead =
          blockLeadPaddingFirst && !appliedBlockLead ? blockLeadPaddingFirst : undefined
        appliedBlockLead = true
        return (
          <span
            key={`${keyPrefix}-f-${pIdx}`}
            className="block w-full max-w-full min-w-0 my-2"
            style={lead ? { paddingLeft: lead, boxSizing: "border-box" } : undefined}
          >
            <textarea
              ref={(el) => {
                inputRefs.current[f.id] = el
              }}
              data-field-id={f.id}
              value={v}
              onChange={(e) => onChange(f.id, e.target.value)}
              placeholder={f.defaultValue}
              rows={rows}
              spellCheck={false}
              className={[
                "w-full rounded border px-2.5 py-2 text-[11pt] leading-[1.5] outline-none transition-colors resize-y",
                "placeholder:text-amber-900/45 placeholder:italic",
                filled
                  ? "bg-white border-amber-400/90 text-zinc-900 shadow-sm"
                  : "bg-[#fff2cc] border-amber-400/70 text-zinc-900",
                "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400/25",
              ].join(" ")}
              style={fontStyle}
            />
          </span>
        )
      }

      return (
        <input
          key={`${keyPrefix}-f-${pIdx}`}
          ref={(el) => {
            inputRefs.current[f.id] = el
          }}
          data-field-id={f.id}
          type="text"
          value={v}
          onChange={(e) => onChange(f.id, e.target.value)}
          placeholder={f.defaultValue}
          spellCheck={false}
          className={[
            "inline align-baseline max-w-[min(100%,52rem)] min-h-[1.35em] px-1 py-px rounded-sm align-middle",
            "border outline-none transition-colors text-[11pt] leading-normal",
            filled
              ? "bg-white border-amber-400/80 text-zinc-900 shadow-sm"
              : "bg-[#fff2cc] border-amber-400/70 text-zinc-900",
            "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400/25",
          ].join(" ")}
          style={{ ...fontStyle, fontWeight: filled ? 500 : 400 }}
        />
      )
    })
  }

  const bodyFont = "11pt"

  return (
    <div className="rounded-2xl bg-gradient-to-b from-primary/10 to-muted/30 p-3 sm:p-4 md:p-7 shadow-inner border border-border/60 overflow-x-auto">
      <div className="mx-auto flex min-w-0 max-w-[calc(210mm+48px)] flex-col gap-2">
        <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">Vista previa · formato Word</span>
          <span className="tabular-nums text-muted-foreground/80">A4 · fuente similar al modelo</span>
        </div>
        <div
          className="demand-paper-sheet mx-auto w-[210mm] min-w-[210mm] max-w-[210mm] shrink-0 bg-white text-neutral-900 shadow-[0_12px_40px_-8px_hsl(var(--foreground)/0.12)] border border-border/80 print:shadow-none dark:border-neutral-300/50"
          style={{
            minHeight: "260mm",
            padding: "22mm 24mm 26mm",
            fontFamily: WORD_PAGE_FONT,
            fontSize: bodyFont,
            lineHeight: 1.5,
          }}
        >
          {visibleParagraphs && visibleParagraphs.length > 0
            ? visibleParagraphs.map((para, idx) => {
                const trimmed = para.text.replace(/^\t+/, "")
                if (!trimmed.trim()) return <div key={`p-${idx}`} className="h-3" aria-hidden />

                const rawParts =
                  para.tokens.length > 0 ? partsFromParagraphTokens(para) : parseLineTokens(trimmed)
                const { parts, blockLeadPadding } = stripLeadingWhitespaceBeforeBlockField(
                  rawParts,
                  fieldById,
                )
                const alignCls = alignClassFromPara(para.align)
                const indentStyle = paragraphIndentStyle(para)
                const sizeHalfPt = para.size
                const fs = sizeHalfPt ? `${sizeHalfPt / 2}pt` : bodyFont
                let paraClass = `${alignCls} mb-[0.35em] hyphens-auto`
                if (para.isSectionHeader) paraClass += " font-bold mt-5 mb-1.5"
                else if (para.bold) paraClass += " font-semibold"

                return (
                  <p
                    key={`p-${idx}`}
                    className={paraClass}
                    style={{
                      ...indentStyle,
                      fontSize: fs,
                      fontFamily: WORD_PAGE_FONT,
                    }}
                  >
                    {renderFieldParts(parts, `sp-${idx}`, fs, blockLeadPadding)}
                  </p>
                )
              })
            : linesFallback.map((line, idx) => {
                const klass = classifyParagraph(line)
                if (klass === "empty") return <div key={idx} className="h-3" aria-hidden />

                const indent = leadingTabs(line)
                const trimmed = line.replace(/^\t+/, "")
                const parts = parseLineTokens(trimmed)

                let paraClass = "text-justify mb-[0.35em]"
                if (klass === "title")
                  paraClass =
                    "text-center text-sm font-bold tracking-wide mb-3 mt-2 uppercase"
                else if (klass === "section") paraClass = "font-bold mt-5 mb-1"

                const indentStyle = indent ? { paddingLeft: `${Math.min(indent, 4) * 1.25}rem` } : undefined

                return (
                  <p
                    key={idx}
                    className={paraClass}
                    style={{ ...indentStyle, fontFamily: WORD_PAGE_FONT, fontSize: bodyFont }}
                  >
                    {renderFieldParts(parts, `fb-${idx}`, bodyFont)}
                  </p>
                )
              })}
        </div>
      </div>
    </div>
  )
}

function LawyerPanel({
  lawyer,
  jurisdiction,
  onChange,
  onClose,
}: {
  lawyer: LawyerProfile
  jurisdiction: Jurisdiction
  onChange: (patch: Partial<LawyerProfile>) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      <aside
        className="relative h-full w-full max-w-full sm:w-[min(420px,100vw)] sm:max-w-[420px] bg-card text-card-foreground shadow-xl border-l border-border overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4 sm:px-6 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Datos del abogado</h2>
            <p className="text-xs text-muted-foreground">Aplica a las plantillas con tokens {"{{ABOGADO_*}}"} ({jurisdiction})</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</label>
            <Input value={lawyer.name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Matrícula</label>
            <Input
              value={lawyer.enrollment ?? ""}
              onChange={(e) => onChange({ enrollment: e.target.value })}
              placeholder="T° / F° / CPACF / ..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</label>
            <Input value={lawyer.phone ?? ""} onChange={(e) => onChange({ phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
            <Input value={lawyer.email ?? ""} onChange={(e) => onChange({ email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección</label>
            <Input value={lawyer.address ?? ""} onChange={(e) => onChange({ address: e.target.value })} />
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState(() => loadState())
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("PBA")
  const [showLawyer, setShowLawyer] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

  const models = useMemo(
    () => state.models.filter((m) => m.jurisdiction === jurisdiction),
    [jurisdiction, state.models],
  )

  const defaultModelId = useMemo(() => {
    if (models.length === 0) return ""
    const first = models.find((m) => (m.fields?.length ?? 0) > 0) ?? models[0]
    return first.id
  }, [models])

  const [selectedId, setSelectedId] = useState<string>("")
  const [exportBaseName, setExportBaseName] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 240)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const selected = useMemo(
    () => models.find((m) => m.id === selectedId) ?? models[0],
    [models, selectedId],
  )

  const lawyer = state.lawyers[jurisdiction]

  // Per-model field values (persisted)
  const [valuesByModel, setValuesByModel] = useState<Record<string, Record<string, string>>>({})

  // Hydrate persisted values for all models
  useEffect(() => {
    const next: Record<string, Record<string, string>> = {}
    for (const m of state.models) next[m.id] = loadFieldValues(m.id)
    setValuesByModel(next)
  }, [state.models])

  useEffect(() => {
    if (models.length === 0) {
      setSelectedId("")
      return
    }
    if (!models.find((m) => m.id === selectedId)) {
      setSelectedId(defaultModelId)
    }
  }, [defaultModelId, models, selectedId])

  useEffect(() => {
    if (!selected) return
    const safe = `${selected.title} - ${jurisdiction}`.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    setExportBaseName(safe)
  }, [selected?.id, selected?.title, jurisdiction])

  const fieldValues = valuesByModel[selected?.id ?? ""] ?? {}

  const onChangeField = (id: string, value: string) => {
    if (!selected) return
    const next = { ...fieldValues, [id]: value }
    setValuesByModel((prev) => ({ ...prev, [selected.id]: next }))
    saveFieldValues(selected.id, next)
  }

  const onResetCase = () => {
    if (!selected) return
    if (!window.confirm("¿Borrar todos los campos completados de este modelo?")) return
    clearFieldValues(selected.id)
    setValuesByModel((prev) => ({ ...prev, [selected.id]: {} }))
    toast.success("Campos reiniciados.")
  }

  const onJumpNextEmpty = () => {
    if (!selected?.fields?.length) return
    const empty = selected.fields.find((f) => !(fieldValues[f.id] ?? "").trim())
    if (!empty) {
      toast.success("Todos los campos están completos.")
      return
    }
    const el = inputRefs.current[empty.id]
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const onExport = async () => {
    if (!selected) return
    try {
      await exportModelToDocx({
        model: selected,
        jurisdiction,
        lawyer,
        values: fieldValues,
        exportBaseName,
      })
      toast.success("Documento exportado.")
    } catch (e) {
      console.error(e)
      toast.error("No se pudo exportar el documento.")
    }
  }

  const onUpdateLawyer = (patch: Partial<LawyerProfile>) => {
    const next = upsertLawyer(state, jurisdiction, { ...lawyer, ...patch })
    setState(next)
  }

  const { filled, total } = countFilled(selected?.fields, fieldValues)

  return (
    <div className="min-h-screen section-gradient">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-6">
          <div className="flex flex-col gap-3 py-3 lg:gap-2 lg:py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4 md:min-h-[3.5rem] lg:min-h-[4rem]">
            <div className="flex items-center justify-between gap-2 md:min-w-0 md:max-w-[min(100%,280px)] lg:max-w-none">
              <div className="flex items-center gap-2 min-w-0">
                <MRLogo className="shrink-0 h-7 w-auto sm:h-[33px]" width={40} height={33} />
                <div className="leading-tight min-w-0">
                  <div className="text-sm font-semibold text-foreground tracking-tight truncate">
                    Dra. Renó Martina
                  </div>
                  <div className="text-[11px] text-muted-foreground hidden sm:block truncate">
                    Generador de demandas
                  </div>
                </div>
              </div>
              <div className="flex md:hidden items-center gap-1 shrink-0">
                <AdminThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 bg-card border-border text-xs"
                  onClick={() => setShowLawyer(true)}
                  aria-label="Datos del abogado"
                >
                  Abogado
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground px-2 text-xs"
                  onClick={() => {
                    logout()
                    navigate("/login", { replace: true })
                  }}
                >
                  Salir
                </Button>
              </div>
            </div>

            <div className="flex w-full min-w-0 justify-center md:flex-1 md:px-2">
              <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0">
              <AdminThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="bg-card border-border"
                onClick={() => setShowLawyer(true)}
              >
                Datos del abogado
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  logout()
                  navigate("/login", { replace: true })
                }}
              >
                Salir
              </Button>
            </div>
            </div>

            {/* Selector de modelo (móvil / tablet): fuera del flex-row para ancho completo */}
            {models.length > 0 ? (
              <div className="lg:hidden border-t border-border/50 pt-3 -mx-1 px-1">
                <label htmlFor="admin-model-select" className="sr-only">
                  Modelo de demanda
                </label>
                <select
                  id="admin-model-select"
                  value={selected?.id ?? ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="flex h-12 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-10 text-base font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring min-h-[48px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.65rem center",
                    backgroundSize: "1.25rem",
                  }}
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={[
          "mx-auto max-w-[1400px] px-3 sm:px-6 py-4 sm:py-6 animate-fade-in",
          selected ? "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-6" : "",
        ].join(" ")}
      >
        <div className="grid gap-5 lg:grid-cols-[300px_1fr] lg:gap-6">
          {/* Sidebar: solo escritorio — en móvil el selector va en el header */}
          <aside className="hidden lg:block lg:sticky lg:top-[4.5rem] lg:self-start">
            <div className="glass-card rounded-2xl p-3 shadow-sm">
              <div className="px-2 pb-2 pt-1 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modelos {jurisdiction}
                </h2>
                <span className="text-[11px] tabular-nums text-muted-foreground/80">{models.length}</span>
              </div>
              <ModelList
                models={models}
                selectedId={selected?.id ?? ""}
                onSelect={setSelectedId}
                fieldValuesByModel={valuesByModel}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 space-y-3 sm:space-y-4">
            {!selected ? (
              <div className="glass-card rounded-2xl p-8 sm:p-12 text-center text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">
                  {models.length === 0
                    ? "No hay demandas cargadas"
                    : "No hay un modelo seleccionado"}
                </p>
                {models.length === 0 ? (
                  <p className="text-sm max-w-md mx-auto">
                    El catálogo está vacío. Podés ir sumando plantillas de a una cuando las tengas
                    listas.
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {/* Barra del modelo: orden de lectura → acción */}
                <div className="glass-card rounded-2xl p-3 sm:p-5 shadow-sm space-y-4 sm:space-y-5 border border-border/50">
                  {/* 1 · Título */}
                  <div className="min-w-0 space-y-2">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-semibold text-foreground leading-snug tracking-tight">
                      {selected.title}
                    </h1>
                    {/* 2 · Contexto + fecha */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium uppercase tracking-wide text-muted-foreground/90">
                        {jurisdictionShortLabel(jurisdiction)} · Demanda
                      </span>
                      <span className="text-border hidden sm:inline" aria-hidden>
                        ·
                      </span>
                      <span>
                        Modelo actualizado el{" "}
                        <time dateTime={selected.updatedAt}>{formatUpdatedAt(selected.updatedAt)}</time>
                      </span>
                    </div>
                  </div>

                  {selected.fields?.length ? (
                    <>
                      {/* 3 · Progreso */}
                      <div className="pt-0.5 border-t border-border/60">
                        <ProgressBar filled={filled} total={total} />
                      </div>

                      {/* 4 · Nombre del archivo */}
                      <div className="space-y-1.5 max-w-xl">
                        <label
                          htmlFor="export-filename"
                          className="text-xs font-medium text-muted-foreground block"
                        >
                          Nombre del archivo al exportar
                        </label>
                        <Input
                          id="export-filename"
                          value={exportBaseName}
                          onChange={(e) => setExportBaseName(e.target.value)}
                          placeholder="Ej. Demanda Pérez — Provincia BA"
                          className="h-10 text-sm bg-background"
                          autoComplete="off"
                        />
                        <p className="text-[11px] text-muted-foreground">Se guarda como archivo Word (.docx)</p>
                      </div>

                      {/* 5 · Acciones: navegación de campos a la izquierda, export a la derecha */}
                      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-card min-h-11 flex-1 sm:flex-initial sm:min-h-9"
                            onClick={onJumpNextEmpty}
                          >
                            Próximo campo
                          </Button>
                          <Button variant="ghost" size="sm" className="min-h-11 sm:min-h-9" onClick={onResetCase}>
                            Reiniciar campos
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="hidden lg:inline-flex rounded-full bg-black text-white hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 px-6"
                          onClick={onExport}
                        >
                          Exportar a Word
                        </Button>
                      </div>

                      {/* Ayuda: colapsable en móvil */}
                      <details className="lg:hidden group rounded-xl border border-border/70 bg-muted/40 open:bg-muted/50">
                        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
                          Ayuda · colores y exportación
                          <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="px-3 pb-3 text-[13px] text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
                          Resaltado <span className="font-medium text-foreground">amarillo</span> o{" "}
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">verde</span> = editable;
                          en el .docx el verde exporta en <strong className="text-foreground">negrita</strong>. Podés
                          usar <code className="rounded bg-muted px-1 font-mono text-[11px]">**texto**</code> para negrita.
                        </p>
                      </details>
                      <div className="hidden lg:flex items-start gap-2 rounded-xl bg-muted/50 border border-border/70 px-3 py-2.5 text-[13px] text-muted-foreground">
                        <span className="mt-1 shrink-0 text-primary/70" aria-hidden>
                          ◇
                        </span>
                        <p className="leading-relaxed">
                          En el modelo Word, lo resaltado en{" "}
                          <span className="font-medium text-foreground">amarillo</span> o{" "}
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">verde</span> es reemplazable; en el
                          .docx exportado el verde sale en{" "}
                          <strong className="font-semibold text-foreground">negrita</strong>. Opcional: en un
                          solo run podés usar{" "}
                          <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">**texto**</code>{" "}
                          para negrita. La vista previa imita una hoja A4; el export conserva el formato del
                          modelo.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-2 border-t border-border/60">
                      <div className="space-y-1.5 max-w-xl flex-1">
                        <label htmlFor="export-filename-empty" className="text-xs font-medium text-muted-foreground">
                          Nombre del archivo al exportar
                        </label>
                        <Input
                          id="export-filename-empty"
                          value={exportBaseName}
                          onChange={(e) => setExportBaseName(e.target.value)}
                          placeholder="Ej. Demanda — Provincia BA"
                          className="h-10 text-sm bg-background"
                          autoComplete="off"
                        />
                        <p className="text-[11px] text-muted-foreground">Se guarda como archivo Word (.docx)</p>
                      </div>
                      <Button
                        size="sm"
                        className="hidden lg:inline-flex rounded-full bg-black text-white hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 px-6"
                        onClick={onExport}
                      >
                        Exportar a Word
                      </Button>
                    </div>
                  )}
                </div>

                {/* Document */}
                {selected.fields?.length ? (
                  <DocumentPaper
                    content={selected.content}
                    paragraphs={selected.paragraphs}
                    fields={selected.fields}
                    values={fieldValues}
                    onChange={onChangeField}
                    inputRefs={inputRefs}
                  />
                ) : (
                  <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/50">
                    <p className="text-sm text-muted-foreground mb-3">
                      Esta plantilla todavía no fue cargada con el modelo .docx. Editá el cuerpo
                      libremente o avisá para sumar el modelo correspondiente.
                    </p>
                    <Textarea
                      value={selected.content}
                      readOnly
                      className="min-h-[400px] font-mono text-xs bg-muted/40"
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Barra fija exportar (móvil / tablet): siempre a mano sin scroll */}
      {selected ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-8px_32px_-6px_rgba(0,0,0,0.12)] safe-area-pb px-3 pt-3">
          <Button
            type="button"
            className="mb-1 h-12 w-full rounded-xl text-base font-semibold shadow-sm bg-black text-white hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            onClick={onExport}
          >
            Exportar a Word
          </Button>
        </div>
      ) : null}

      {showLawyer ? (
        <LawyerPanel
          lawyer={lawyer}
          jurisdiction={jurisdiction}
          onChange={onUpdateLawyer}
          onClose={() => setShowLawyer(false)}
        />
      ) : null}

      {showScrollTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={[
            "fixed right-4 sm:right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg ring-1 ring-border transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selected ? "bottom-[7.25rem] lg:bottom-6" : "bottom-6",
          ].join(" ")}
          aria-label="Subir al inicio de la página"
          title="Subir al inicio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
