import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, User, Scale, Mail, Globe, Moon, Sun, Calendar, Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./theme-provider"
import { MRLogo } from "./mr-logo"
import { useEffect, useState } from "react"

export function FloatingNavbar({ lang }: { lang?: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentLang = lang || (pathname.startsWith("/en") ? "en" : "es")

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if ((currentLang === "en" && pathname === "/en") || (currentLang === "es" && pathname === "/")) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const toggleLanguage = () => {
    // Determinar la nueva ruta basada en el idioma actual
    let newPath = ""

    if (currentLang === "en") {
      // Cambiar de inglés a español
      newPath = pathname.replace(/^\/en/, "")
      if (newPath === "") newPath = "/"
    } else {
      // Cambiar de español a inglés
      if (pathname === "/") {
        newPath = "/en"
      } else {
        newPath = "/en" + pathname
      }
    }

    console.log(`Cambiando idioma de ${currentLang} a ${currentLang === "en" ? "es" : "en"}`)
    console.log(`Ruta actual: ${pathname}`)
    console.log(`Nueva ruta: ${newPath}`)

    // Usar navigate en lugar de window.location para evitar recargas completas
    navigate(newPath)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navItems = [
    {
      to: currentLang === "en" ? "/en" : "/",
      labelEn: "Home",
      labelEs: "Inicio",
      icon: Home,
    },
    {
      to: currentLang === "en" ? "/en/about" : "/about",
      labelEn: "About",
      labelEs: "Sobre mí",
      icon: User,
    },
    {
      to: currentLang === "en" ? "/en/practice-areas" : "/practice-areas",
      labelEn: "Practice areas",
      labelEs: "Áreas",
      icon: Scale,
    },
    {
      to: currentLang === "en" ? "/en/contact" : "/contact",
      labelEn: "Contact",
      labelEs: "Contacto",
      icon: Mail,
    },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="flex justify-center py-4">
          <div className="glass-card dark:glass-card-dark flex items-center space-x-2 rounded-full p-2">
            <Link to={currentLang === "en" ? "/en" : "/"} onClick={handleHomeClick} className="mx-4">
              <MRLogo className="transition-transform duration-300 hover:scale-105" />
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={item.to === (currentLang === "en" ? "/en" : "/") ? handleHomeClick : undefined}
                className={`px-4 py-2 rounded-full transition-colors text-sm font-medium
                  ${
                    pathname === item.to
                      ? "bg-black text-white dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {currentLang === "en" ? item.labelEn : item.labelEs}
              </Link>
            ))}
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              asChild
              className="bg-black hover:bg-gray-800 text-white rounded-full h-9 px-4"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              <Link to={currentLang === "en" ? "/en/contact" : "/contact"} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{currentLang === "en" ? "Book consultation" : "Agendar consulta"}</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {mounted && (
                <>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleLanguage}>
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle language</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Completamente rediseñado */}
      <nav className="fixed left-0 right-0 top-0 z-50 md:hidden">
        <div className="glass-card dark:glass-card-dark backdrop-blur-md bg-white/90 dark:bg-black/90 flex items-center justify-between p-3">
          <Link to={currentLang === "en" ? "/en" : "/"} onClick={handleHomeClick} className="ml-2">
            <MRLogo width={32} height={26} className="transition-transform duration-300 hover:scale-105" />
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {mounted && (
                <>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleLanguage}>
              <Globe className="h-5 w-5" />
              <span className="sr-only">Toggle language</span>
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Modal - Implementación simplificada */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />

          {/* Menu Content */}
          <div className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <MRLogo width={32} height={26} className="mr-3" />
                <h2 className="text-lg font-medium flex-1">
                  {currentLang === "en" ? "Navigation menu" : "Menú de navegación"}
                </h2>
                <button
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={(e) => {
                      if (item.to === (currentLang === "en" ? "/en" : "/")) {
                        handleHomeClick(e)
                      }
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors
                      ${pathname === item.to ? "bg-black text-white dark:bg-black" : "text-gray-700 dark:text-gray-300"}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{currentLang === "en" ? item.labelEn : item.labelEs}</span>
                  </Link>
                ))}

                {/* Book Consultation Button */}
                <Link
                  to={currentLang === "en" ? "/en/contact" : "/contact"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mt-6 bg-black text-white rounded-full py-3 px-4"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{currentLang === "en" ? "Book consultation" : "Agendar consulta"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

