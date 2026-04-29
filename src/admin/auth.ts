const AUTH_KEY = "mr_admin_auth_v1"

type AuthState = {
  loggedIn: boolean
  at: string
}

function getEnv(key: "VITE_ADMIN_EMAIL" | "VITE_ADMIN_PASSWORD") {
  return (import.meta as unknown as { env: Record<string, string | undefined> }).env[key]
}

export function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as AuthState
    return Boolean(parsed?.loggedIn)
  } catch {
    return false
  }
}

export function login(email: string, password: string): { ok: boolean; message?: string } {
  const expectedEmail = getEnv("VITE_ADMIN_EMAIL")
  const expectedPassword = getEnv("VITE_ADMIN_PASSWORD")

  if (!expectedEmail || !expectedPassword) {
    return { ok: false, message: "Falta configurar VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD." }
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedEmail !== expectedEmail.trim().toLowerCase() || password !== expectedPassword) {
    return { ok: false, message: "Credenciales inválidas." }
  }

  const state: AuthState = { loggedIn: true, at: new Date().toISOString() }
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
  return { ok: true }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

