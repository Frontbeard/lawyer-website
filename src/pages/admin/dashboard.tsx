import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import type { Jurisdiction, LawyerProfile } from "../../admin/types"
import { loadState, updateModelContent, upsertLawyer } from "../../admin/storage"
import { exportModelToDocx } from "../../admin/docx"
import { logout } from "../../admin/auth"

function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState(() => loadState())
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("CABA")
  const models = useMemo(() => state.models.filter((m) => m.jurisdiction === jurisdiction), [jurisdiction, state.models])
  const [selectedId, setSelectedId] = useState<string>(models[0]?.id ?? `${jurisdiction}:accidente_trabajo`)

  const selected = useMemo(
    () => models.find((m) => m.id === selectedId) ?? models[0],
    [models, selectedId],
  )

  const lawyer = state.lawyers[jurisdiction]

  const [draftTitle, setDraftTitle] = useState(selected?.title ?? "")
  const [draftContent, setDraftContent] = useState(selected?.content ?? "")

  // Mantener el editor en sync al cambiar selección/jurisdicción
  useEffect(() => {
    setDraftTitle(selected?.title ?? "")
    setDraftContent(selected?.content ?? "")
  }, [selected?.id, jurisdiction])

  const onSave = () => {
    if (!selected) return
    const next = updateModelContent(state, jurisdiction, selected.id, { title: draftTitle, content: draftContent })
    setState(next)
    toast.success("Modelo guardado.")
  }

  const onExport = async () => {
    if (!selected) return
    try {
      await exportModelToDocx({ model: selected, jurisdiction, lawyer })
      toast.success("Documento exportado.")
    } catch (e) {
      console.error(e)
      toast.error("No se pudo exportar el documento.")
    }
  }

  const onUpdateLawyer = (patch: Partial<LawyerProfile>) => {
    const next = upsertLawyer(state, jurisdiction, { ...lawyer, ...patch })
    setState(next)
    toast.success("Datos del abogado actualizados.")
  }

  return (
    <div className="container py-10 md:py-16 md:mt-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Dashboard</h1>
            <p className="text-muted-foreground">Gestión de modelos de demandas (CABA / PBA) y exportación a Word.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-background hover:bg-black hover:text-white transition-colors"
              onClick={() => {
                logout()
                navigate("/admin/login", { replace: true })
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={jurisdiction === "CABA" ? "default" : "outline"}
            className={jurisdiction === "CABA" ? "bg-black hover:bg-black/90" : "bg-background"}
            onClick={() => {
              setJurisdiction("CABA")
              setSelectedId("CABA:accidente_trabajo")
            }}
          >
            CABA
          </Button>
          <Button
            variant={jurisdiction === "PBA" ? "default" : "outline"}
            className={jurisdiction === "PBA" ? "bg-black hover:bg-black/90" : "bg-background"}
            onClick={() => {
              setJurisdiction("PBA")
              setSelectedId("PBA:accidente_trabajo")
            }}
          >
            Provincia de Buenos Aires
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Modelos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {models.map((m) => (
                  <button
                    key={m.id}
                    className={[
                      "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                      selected?.id === m.id ? "bg-muted/60" : "",
                    ].join(" ")}
                    onClick={() => setSelectedId(m.id)}
                    type="button"
                  >
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">Actualizado: {formatUpdatedAt(m.updatedAt)}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del abogado ({jurisdiction})</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input value={lawyer.name} onChange={(e) => onUpdateLawyer({ name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matrícula</label>
                  <Input
                    value={lawyer.enrollment ?? ""}
                    onChange={(e) => onUpdateLawyer({ enrollment: e.target.value })}
                    placeholder="T° / F° / CPACF / ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input value={lawyer.phone ?? ""} onChange={(e) => onUpdateLawyer({ phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={lawyer.email ?? ""} onChange={(e) => onUpdateLawyer({ email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dirección</label>
                  <Input value={lawyer.address ?? ""} onChange={(e) => onUpdateLawyer({ address: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Editor de modelo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selected ? (
                  <p className="text-muted-foreground">No hay un modelo seleccionado.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Título</label>
                      <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contenido</label>
                      <Textarea
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        className="min-h-[360px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Variables disponibles: <code className="font-mono">{"{{JURISDICCION}}"}</code>,{" "}
                        <code className="font-mono">{"{{ABOGADO_NOMBRE}}"}</code>,{" "}
                        <code className="font-mono">{"{{ABOGADO_MATRICULA}}"}</code>,{" "}
                        <code className="font-mono">{"{{ABOGADO_DIRECCION}}"}</code>,{" "}
                        <code className="font-mono">{"{{ABOGADO_EMAIL}}"}</code>,{" "}
                        <code className="font-mono">{"{{ABOGADO_TELEFONO}}"}</code>.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button className="bg-black hover:bg-black/90" onClick={onSave}>
                        Guardar
                      </Button>
                      <Button variant="outline" className="bg-background" onClick={onExport}>
                        Exportar Word (.docx)
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

