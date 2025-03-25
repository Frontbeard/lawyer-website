import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Link } from "react-router-dom"
import { Scale, ArrowRight, Users, Trophy, FileText, Clock, BookOpen, MessageCircle, Video, Star } from "lucide-react"
import { QuickContactForm } from "../components/quick-contact-form"
import banner from "../assets/images/banner.jpg"
import aboutdr from "../assets/images/about.jpg"

export default function HomePage({ lang }: { lang: string }) {
  return (
    <div>
      {/* Hero Section with Image Background */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${banner})`,
          }}
        />

        {/* Enhanced Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />

        {/* White shadow connector */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Content */}
        <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center px-4 sm:px-6">
          <div className="text-white space-y-4 md:space-y-6 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl animate-fade-down">
              {lang === "en" ? "Legal excellence" : "Excelencia legal"}
            </h1>
            <h2
              className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl animate-fade-down"
              style={{ animationDelay: "0.2s" }}
            >
              {lang === "en" ? "& professional service" : "y servicio profesional"}
            </h2>
            <p
              className="text-base md:text-lg lg:text-xl text-gray-200 animate-fade-up max-w-[540px]"
              style={{ animationDelay: "0.3s" }}
            >
              {lang === "en"
                ? "Specialized legal services tailored to your needs. Professional, efficient, and reliable counsel."
                : "Servicios legales especializados adaptados a sus necesidades. Asesoramiento profesional, eficiente y confiable."}
            </p>
            <div
              className="flex gap-3 md:gap-4 pt-4 justify-center md:justify-start animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Button
                size="lg"
                className="text-base relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg group bg-black hover:bg-gray-800 text-white"
              >
                <Link to={lang === "en" ? "/en/contact" : "/contact"}>
                  <span className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative">{lang === "en" ? "Contact now" : "Contactar ahora"}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Link to={lang === "en" ? "/en/practice-areas" : "/practice-areas"}>
                  {lang === "en" ? "Learn more" : "Saber más"}
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block max-w-md mx-auto w-full">
            <QuickContactForm lang={lang} />
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-background to-sky-50/50 dark:to-sky-950/50">
        <div className="container px-4 sm:px-6">
          <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                {lang === "en" ? "About me" : "Sobre mí"}
              </h2>
            </div>

            <div className="grid gap-8 md:gap-12 md:grid-cols-2 items-center">
              <div className="relative aspect-[3/4] md:aspect-[4/5] h-[400px] md:h-[450px] mx-auto md:mx-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden transform transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={aboutdr || "/placeholder.svg"}
                  alt="Martina Reno - Abogada"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="space-y-5 md:space-y-6 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-semibold">{lang === "en" ? "Martina Renó" : "Martina Renó"}</h3>
                <p className="text-base md:text-lg text-muted-foreground">
                  {lang === "en"
                    ? "Lawyer graduated from the University of Buenos Aires, registered to practice in Buenos Aires City (CABA). I bring solid legal knowledge and a strategic approach to provide comprehensive solutions for your legal needs."
                    : "Abogada graduada de la Universidad de Buenos Aires, matriculada en la Ciudad Autónoma de Buenos Aires (CABA). Aporto sólidos conocimientos legales y un enfoque estratégico para brindar soluciones integrales a tus necesidades jurídicas."}
                </p>
                <p className="text-base md:text-lg text-muted-foreground">
                  {lang === "en"
                    ? "My practice focuses on civil and labor law, with special emphasis on family matters, successions, and workplace disputes. I believe in providing personalized attention to each client."
                    : "Mi práctica se centra en derecho civil y laboral, con especial énfasis en asuntos de familia, sucesiones y disputas laborales. Creo en brindar atención personalizada a cada cliente."}
                </p>
                <Button
                  size="lg"
                  className="mt-2 md:mt-4 transition-all duration-300 hover:scale-105 bg-black hover:bg-gray-800 text-white"
                >
                  <Link to={lang === "en" ? "/en/about" : "/about"}>
                    <span className="flex items-center gap-2">
                      {lang === "en" ? "Learn more about me" : "Conoce más sobre mí"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas Preview Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-blue-50/50 dark:from-sky-950/50 dark:to-blue-950/50">
        <div className="container px-4 sm:px-6">
          <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                {lang === "en" ? "Practice areas" : "Áreas de práctica"}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
                {lang === "en"
                  ? "Specialized legal services in various areas of law"
                  : "Servicios legales especializados en diversas áreas del derecho"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: FileText,
                  titleEn: "Labor Law",
                  titleEs: "Derecho laboral",
                  descriptionEn:
                    "Representation in wrongful termination, labor rights, and employment contract disputes.",
                  descriptionEs:
                    "Representación en despidos injustificados, derechos laborales y disputas de contratos de trabajo.",
                },
                {
                  icon: FileText,
                  titleEn: "Successions",
                  titleEs: "Sucesiones",
                  descriptionEn: "Comprehensive guidance through inheritance processes and estate distribution.",
                  descriptionEs: "Asesoramiento integral en procesos sucesorios y distribución de bienes hereditarios.",
                },
                {
                  icon: Users,
                  titleEn: "Divorces",
                  titleEs: "Divorcios",
                  descriptionEn: "Legal representation in divorce proceedings, property division, and related matters.",
                  descriptionEs:
                    "Representación legal en procesos de divorcio, división de bienes y asuntos relacionados.",
                },
              ].map((area, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 rounded-3xl hover:scale-[1.02] h-full"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                        <area.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                        {lang === "en" ? area.titleEn : area.titleEs}
                      </h3>
                      <p className="text-muted-foreground">{lang === "en" ? area.descriptionEn : area.descriptionEs}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-cyan-50/50 dark:from-blue-950/50 dark:to-cyan-950/50">
        <div className="container px-4 sm:px-6">
          <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                {lang === "en" ? "Why choose me" : "¿Por qué elegirme?"}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
                {lang === "en"
                  ? "Committed to providing exceptional legal services with a personal touch"
                  : "Comprometida a brindar servicios legales excepcionales con un toque personal"}
              </p>
            </div>

            <div className="grid gap-4 md:gap-6 items-stretch">
              {/* Main Feature Card */}
              <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl md:rounded-3xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                      <Scale className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                      {lang === "en" ? "Expert legal advice" : "Asesoramiento legal experto"}
                    </h3>
                    <p className="text-muted-foreground">
                      {lang === "en"
                        ? "Providing comprehensive legal solutions with years of experience in various areas of law. My commitment is to deliver exceptional results while maintaining clear communication throughout the process."
                        : "Brindando soluciones legales integrales con años de experiencia en diversas áreas del derecho. Mi compromiso es entregar resultados excepcionales manteniendo una comunicación clara durante todo el proceso."}
                    </p>
                    <Button
                      variant="ghost"
                      className="group-hover:translate-x-1 transition-all duration-300 relative overflow-hidden hover:bg-black hover:text-white"
                    >
                      <Link to={lang === "en" ? "/en/practice-areas" : "/practice-areas"}>
                        <span className="relative z-10 flex items-center gap-2">
                          {lang === "en" ? "Learn more" : "Saber más"}
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl md:rounded-3xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                        {lang === "en" ? "Client focused" : "Enfoque en el cliente"}
                      </h3>
                      <p className="text-muted-foreground">
                        {lang === "en" ? "Your success is my priority" : "Tu éxito es mi prioridad"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl md:rounded-3xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                        {lang === "en" ? "Proven success" : "Éxito comprobado"}
                      </h3>
                      <p className="text-muted-foreground">
                        {lang === "en" ? "Track record of successful cases" : "Historial de casos exitosos"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl md:rounded-3xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                        {lang === "en" ? "Quick response" : "Respuesta rápida"}
                      </h3>
                      <p className="text-muted-foreground">
                        {lang === "en"
                          ? "Fast and efficient communication to address your legal needs promptly"
                          : "Comunicación rápida y eficiente para atender sus necesidades legales con prontitud"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl md:rounded-3xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit transition-transform duration-300 group-hover:scale-110">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                        {lang === "en" ? "Specialized knowledge" : "Conocimiento especializado"}
                      </h3>
                      <p className="text-muted-foreground">
                        {lang === "en"
                          ? "Continuous education and up-to-date with legal developments"
                          : "Educación continua y actualización con desarrollos legales"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How I Work Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-cyan-50/50 to-sky-50/50 dark:from-cyan-950/50 dark:to-sky-950/50">
        <div className="container px-4 sm:px-6">
          <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                {lang === "en" ? "How I work" : "¿Cómo trabajo?"}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
                {lang === "en"
                  ? "A simple and efficient process to handle your case"
                  : "Un proceso simple y eficiente para manejar tu caso"}
              </p>
            </div>

            <div className="grid gap-4 md:gap-6">
              {[
                {
                  icon: MessageCircle,
                  stepEn: "Initial contact",
                  stepEs: "Contacto inicial",
                  titleEn: "Let's connect",
                  titleEs: "Conectemos",
                  descriptionEn:
                    "Reach out through WhatsApp or Instagram. Share your situation briefly, and I'll guide you on whether a consultation would be beneficial for your case.",
                  descriptionEs:
                    "Contáctame por WhatsApp o Instagram. Cuéntame brevemente tu situación y te orientaré sobre si una consulta sería beneficiosa para tu caso.",
                },
                {
                  icon: Video,
                  stepEn: "Consultation",
                  stepEs: "Consulta",
                  titleEn: "Virtual meeting",
                  titleEs: "Reunión virtual",
                  descriptionEn:
                    "We'll schedule a virtual consultation at your convenience. This format allows for flexible scheduling and efficient case discussion. Note that consultations are paid except for work dismissal or ART cases.",
                  descriptionEs:
                    "Programaremos una consulta virtual según tu conveniencia. Este formato permite horarios flexibles y una discusión eficiente del caso. Las consultas son aranceladas excepto en casos de despido laboral o ART.",
                },
                {
                  icon: FileText,
                  stepEn: "Proposal",
                  stepEs: "Propuesta",
                  titleEn: "Written quote",
                  titleEs: "Presupuesto escrito",
                  descriptionEn:
                    "You'll receive a detailed written proposal including fees, expenses, and payment options. Once approved, we'll begin working on your case, keeping you informed throughout the process in clear, simple terms.",
                  descriptionEs:
                    "Recibirás una propuesta detallada por escrito que incluye honorarios, gastos y opciones de pago. Una vez aprobada, comenzaremos a trabajar en tu caso, manteniéndote informado durante todo el proceso en términos claros y simples.",
                },
              ].map((step, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex items-center gap-4 md:w-48">
                        <div className="p-3 rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {lang === "en" ? `Step ${index + 1}: ${step.stepEn}` : `Paso ${index + 1}: ${step.stepEs}`}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                          {lang === "en" ? step.titleEn : step.titleEs}
                        </h3>
                        <p className="text-muted-foreground">
                          {lang === "en" ? step.descriptionEn : step.descriptionEs}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-background dark:from-sky-950/50 dark:to-background">
        <div className="container px-4 sm:px-6">
          <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                {lang === "en" ? "Client testimonials" : "Testimonios de clientes"}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
                {lang === "en"
                  ? "What my clients say about my services"
                  : "Lo que mis clientes dicen sobre mis servicios"}
              </p>
            </div>

            <div className="grid gap-4 md:gap-6">
              {[
                {
                  nameEn: "Miguel Benitez",
                  nameEs: "Miguel Benitez",
                  roleEn: "Succession case",
                  roleEs: "Caso de sucesión",
                  contentEn:
                    "[...] Without your help, my siblings and I would not have been able to solve anything regarding my father's succession. We didn't even know where to start. Thank you very much for guiding us, explaining everything to us, and handling our case [...]",
                  contentEs:
                    "[...] Sin tu ayuda mis hermanos y yo no habríamos podido solucionar nada de la sucesión de mi papá. No sabíamos ni por dónde empezar. Muchas gracias por guiarnos, explicarnos y llevar a cabo nuestro caso [...]",
                  image:
                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/64675313_10217556943690454_59451036095479808_n.jpg-k0Ap0AyE6OqwkOCwDiekjErTuCfmWE.jpeg",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 rounded-3xl hover:scale-[1.02]"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={lang === "en" ? testimonial.nameEn : testimonial.nameEs}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-semibold transition-colors duration-300 group-hover:text-primary">
                          {lang === "en" ? testimonial.nameEn : testimonial.nameEs}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lang === "en" ? testimonial.roleEn : testimonial.roleEs}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-primary text-primary transition-transform duration-300 group-hover:scale-110"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      {lang === "en" ? testimonial.contentEn : testimonial.contentEs}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

