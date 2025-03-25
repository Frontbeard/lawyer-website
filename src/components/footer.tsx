import { Linkedin, Phone, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  // Usar useLocation para reaccionar a cambios en la ruta
  const location = useLocation();
  const lang = location.pathname.startsWith("/en") ? "en" : "es";

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
              © {currentYear} Martina Renó.{" "}
              {lang === "en"
                ? "All rights reserved."
                : "Todos los derechos reservados."}
            </p>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <Link
                to={lang === "en" ? "/en" : "/"}
                className="hover:text-primary transition-colors"
              >
                {lang === "en" ? "Home" : "Inicio"}
              </Link>
              <Link
                to={lang === "en" ? "/en/about" : "/about"}
                className="hover:text-primary transition-colors"
              >
                {lang === "en" ? "About" : "Sobre mí"}
              </Link>
              <Link
                to={lang === "en" ? "/en/contact" : "/contact"}
                className="hover:text-primary transition-colors"
              >
                {lang === "en" ? "Contact" : "Contacto"}
              </Link>
            </nav>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>
                {lang === "en"
                  ? "Designed & Developed by"
                  : "Diseñado y Desarrollado por"}
              </span>
              <Link
                to="https://www.instagram.com/frontbeard/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                Frontbeard
              </Link>
              <span>
                {lang === "en"
                  ? "– Web Design & Development"
                  : "– Diseño y Desarrollo Web"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
