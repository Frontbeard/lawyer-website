import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { isLoggedIn, login } from "../admin/auth"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? "/"
  }, [location.state])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) navigate(from, { replace: true })
  }, [from, navigate])

  return (
    <div className="container py-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-3">Acceso</h1>
          <p className="text-muted-foreground">Panel de gestión de modelos de demandas</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setLoading(true)
                try {
                  const result = login(email, password)
                  if (!result.ok) {
                    toast.error(result.message ?? "No se pudo iniciar sesión.")
                    return
                  }
                  toast.success("Sesión iniciada.")
                  navigate(from, { replace: true })
                } finally {
                  setLoading(false)
                }
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="username"
                  placeholder="usuario@dominio.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button className="w-full bg-black hover:bg-black/90" type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Requiere configurar <code className="font-mono">VITE_ADMIN_EMAIL</code> y{" "}
                <code className="font-mono">VITE_ADMIN_PASSWORD</code> en Vercel.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

