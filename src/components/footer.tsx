import { Linkedin, Phone } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const lang = window.location.pathname.startsWith("/en") ? "en" : "es"

  return (
    <footer className="w-full border-t">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-8">
            <Link
              to="https://www.linkedin.com/in/martina-alejandra-reno/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              to="https://wa.me/5491168390473"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-6 w-6" />
              <span className="sr-only">WhatsApp</span>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Martina Renó. {lang === "en" ? "All rights reserved." : "Todos los derechos reservados."}
            </p>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <Link to={lang === "en" ? "/en" : "/"} className="hover:text-primary transition-colors">
                {lang === "en" ? "Home" : "Inicio"}
              </Link>
              <Link to={lang === "en" ? "/en/about" : "/about"} className="hover:text-primary transition-colors">
                {lang === "en" ? "About" : "Sobre mí"}
              </Link>
              <Link to={lang === "en" ? "/en/contact" : "/contact"} className="hover:text-primary transition-colors">
                {lang === "en" ? "Contact" : "Contacto"}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

