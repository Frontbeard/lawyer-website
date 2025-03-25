"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/card"
import { GraduationCap, Award, BookOpen, Globe, ExternalLink } from "lucide-react"
import doctora from "../assets/images/doctora.jpg"

export default function AboutPage({ lang }: { lang: string }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <div className="container py-16 md:py-20 md:mt-16 px-4 sm:px-6">
      <div className="grid gap-8 md:gap-12 lg:grid-cols-5 max-w-5xl mx-auto">
        {/* Left column - Image and Education */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="relative aspect-[3/4] lg:aspect-[3/4] max-w-sm mx-auto lg:mx-0 h-[575px]">
            <img
              src={doctora || "/placeholder.svg"}
              alt="Martina Renó - Graduation"
              className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
            />
          </div>

          {/* Education */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold md:text-2xl mb-4">{lang === "en" ? "Education" : "Educación"}</h2>
            <div className="flex flex-col gap-4">
              {/* First card */}
              <Card className="group hover:shadow-lg transition-all rounded-2xl w-full">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{lang === "en" ? "Law degree" : "Abogacía"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "University of Buenos Aires" : "Universidad de Buenos Aires"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "Faculty of Law" : "Facultad de Derecho"}
                      </p>
                      <p className="text-sm text-muted-foreground">{lang === "en" ? "2024" : "2024"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Second card - Updated with EF SET certificate link */}
              <Card className="group hover:shadow-lg transition-all rounded-2xl w-full">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{lang === "en" ? "Language" : "Idioma"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "English - C1 Advanced" : "Inglés - C1 Avanzado"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "EF SET Certificate" : "Certificado EF SET"}
                      </p>
                      <a
                        href="https://cert.efset.org/etSUgf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        {lang === "en" ? "View certificate" : "Ver certificado"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right column - About Me text and Professional Development */}
        <div className="lg:col-span-3">
          {/* About Me text */}
          <div>
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-4">
              {lang === "en" ? "About me" : "Sobre mí"}
            </h1>
            <div className="space-y-4">
              {lang === "en" ? (
                <>
                  <p className="text-muted-foreground text-base md:text-lg">
                    I am Martina Reno, a lawyer graduated from the University of Buenos Aires (UBA) and registered in
                    the Autonomous City of Buenos Aires (CABA). I specialize in Civil and Criminal Law, providing
                    comprehensive advice and legal representation in cases of civil liability, contracts, family law,
                    successions, as well as defense and assistance in criminal proceedings.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    My approach combines deep legal knowledge with a strong commitment to understanding each client's
                    needs, offering strategic and personalized solutions. I believe in the importance of close and
                    transparent support, ensuring that each person has the best defense and protection of their rights.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Additionally, I keep myself constantly updated through legal workshops and seminars, which allows me
                    to offer advice aligned with the latest regulations and trends in law.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    If you are looking for a legal service based on trust, ethics, and excellence, I will be delighted
                    to help you.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Soy Martina Reno, abogada egresada de la Universidad de Buenos Aires (UBA) y matriculada en la
                    Ciudad Autónoma de Buenos Aires (CABA). Me especializo en Derecho Civil y Penal, brindando
                    asesoramiento integral y representación legal en casos de responsabilidad civil, contratos, derecho
                    de familia, sucesiones, así como en defensa y asistencia en procesos penales.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Mi enfoque combina un profundo conocimiento legal con un fuerte compromiso por entender las
                    necesidades de cada cliente, ofreciendo soluciones estratégicas y personalizadas. Creo en la
                    importancia de un acompañamiento cercano y transparente, asegurando que cada persona cuente con la
                    mejor defensa y protección de sus derechos.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Además, me mantengo en constante actualización a través de talleres y seminarios legales, lo que me
                    permite ofrecer un asesoramiento alineado con las últimas normativas y tendencias del derecho.
                  </p>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Si buscas un servicio jurídico basado en la confianza, la ética y la excelencia, voy a estar
                    encantada de ayudarte.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Professional Development - Aligned with Education */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold md:text-2xl mb-4">
              {lang === "en" ? "Professional development" : "Desarrollo profesional"}
            </h2>
            <div className="flex flex-col gap-4">
              {/* First card */}
              <Card className="group hover:shadow-lg transition-all rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{lang === "en" ? "Legal writing" : "Redacción jurídica"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en"
                          ? "Specialized training in legal documentation"
                          : "Formación especializada en documentación legal"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en"
                          ? "Proficient in drafting legal documents"
                          : "Competente en redacción de documentos legales"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "Contract and agreement expertise" : "Experiencia en contratos y acuerdos"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Second card */}
              <Card className="group hover:shadow-lg transition-all rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {lang === "en" ? "Continuous learning" : "Formación continua"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en"
                          ? "Regular participation in legal workshops"
                          : "Participación regular en talleres legales"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en"
                          ? "Updated with latest legal developments"
                          : "Actualizada con los últimos desarrollos legales"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "en" ? "Ongoing professional education" : "Educación profesional continua"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

