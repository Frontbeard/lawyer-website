import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  FileText,
  Users,
  Car,
  Heart,
  MessageCircle,
  Gavel,
  ScrollText,
  ShieldCheck,
  Video,
  UserCheck,
} from "lucide-react"

export default function PracticeAreasPage({ lang }: { lang: string }) {
  const areas = [
    {
      icon: ShieldCheck,
      titleEn: "ART (Work Risk Insurance)",
      titleEs: "ART",
      descriptionEn: "Legal assistance for work-related accidents and occupational diseases claims.",
      descriptionEs: "Asistencia legal para reclamos por accidentes laborales y enfermedades profesionales.",
    },
    {
      icon: FileText,
      titleEn: "Labor Law",
      titleEs: "Derecho Laboral",
      descriptionEn: "Representation in wrongful termination, labor rights, and employment contract disputes.",
      descriptionEs:
        "Representación en despidos injustificados, derechos laborales y disputas de contratos de trabajo.",
    },
    {
      icon: ScrollText,
      titleEn: "Successions",
      titleEs: "Sucesiones",
      descriptionEn: "Comprehensive guidance through inheritance processes and estate distribution.",
      descriptionEs: "Asesoramiento integral en procesos sucesorios y distribución de bienes hereditarios.",
    },
    {
      icon: Heart,
      titleEn: "Family Violence",
      titleEs: "Violencia familiar",
      descriptionEn: "Legal protection and representation for victims of domestic and family violence.",
      descriptionEs: "Protección legal y representación para víctimas de violencia doméstica y familiar.",
    },
    {
      icon: Gavel,
      titleEn: "Child Support",
      titleEs: "Cuota alimentaria",
      descriptionEn: "Legal assistance in establishing, modifying, and enforcing child support obligations.",
      descriptionEs:
        "Asistencia legal para establecer, modificar y hacer cumplir obligaciones de manutención infantil.",
    },
    {
      icon: MessageCircle,
      titleEn: "Visitation Rights",
      titleEs: "Régimen de comunicación",
      descriptionEn: "Establishing and modifying visitation schedules and parental communication arrangements.",
      descriptionEs: "Establecimiento y modificación de regímenes de visitas y acuerdos de comunicación parental.",
    },
    {
      icon: Users,
      titleEn: "Divorces",
      titleEs: "Divorcios",
      descriptionEn: "Legal representation in divorce proceedings, property division, and related matters.",
      descriptionEs: "Representación legal en procesos de divorcio, división de bienes y asuntos relacionados.",
    },
    {
      icon: Car,
      titleEn: "Traffic Accidents",
      titleEs: "Accidentes de tránsito",
      descriptionEn: "Representation for victims seeking compensation for injuries and damages from traffic accidents.",
      descriptionEs:
        "Representación para víctimas que buscan compensación por lesiones y daños en accidentes de tránsito.",
    },
    {
      icon: UserCheck,
      titleEn: "Mediation",
      titleEs: "Mediación",
      descriptionEn: "Alternative dispute resolution through professional mediation services.",
      descriptionEs: "Resolución alternativa de conflictos a través de servicios profesionales de mediación.",
    },
  ]

  return (
    <div className="container py-16 md:py-20 md:mt-16 px-4 sm:px-6">
      <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
            {lang === "en" ? "Practice areas" : "Áreas de práctica"}
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
            {lang === "en"
              ? "Comprehensive legal services tailored to your needs"
              : "Descubrí cuáles son las áreas del derecho en las que trabajo."}
          </p>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all rounded-3xl h-full">
              <CardHeader>
                <div className="p-3 rounded-2xl bg-primary/10 w-fit mb-4">
                  <area.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{lang === "en" ? area.titleEn : area.titleEs}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{lang === "en" ? area.descriptionEn : area.descriptionEs}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How I Work Section - Moved from homepage */}
        <div className="pt-16 md:pt-20">
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

          <div className="mt-8 md:mt-12 grid gap-4 md:gap-6">
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
                  "Contactame por WhatsApp o Instagram. Contame brevemente tu situación y te orientaré sobre si una consulta sería beneficiosa para tu caso.",
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
                      <p className="text-muted-foreground">{lang === "en" ? step.descriptionEn : step.descriptionEs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

