import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Desplazamiento suave
    })
  }, [pathname])

  return null // Este componente no renderiza nada
}
