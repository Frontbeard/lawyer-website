import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import LoginPage from "./pages/login"
import DashboardPage from "./pages/dashboard"
import { ProtectedRoute } from "./components/protected-route"

export default function App() {
  return (
    <>
      <main className="min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-center" />
    </>
  )
}

