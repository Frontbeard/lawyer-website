import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Mail, MapPin, Clock, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage({ lang }: { lang: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Usando Formspree
      const response = await fetch("https://formspree.io/f/xrbpqkdg", {
        method: "POST",
        body: new FormData(e.currentTarget),
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        toast.success(
          lang === "en"
            ? "Message sent successfully! I'll get back to you soon."
            : "¡Mensaje enviado con éxito! Me pondré en contacto pronto.",
        )
        const form = e.target as HTMLFormElement
        form.reset()
      } else {
        throw new Error("Form submission failed")
      }
    } catch (error) {
      toast.error(
        lang === "en"
          ? "Failed to send message. Please try again later."
          : "Error al enviar el mensaje. Por favor, inténtelo más tarde.",
      )
      console.error("Form error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-16 md:py-24 md:mt-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Ajustado para estar a la misma altura que otras páginas */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-4">
            {lang === "en" ? "Get in touch" : "Contacto"}
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-base md:text-lg">
            {lang === "en"
              ? "Schedule a consultation or send me your inquiries"
              : "Programe una consulta o envíeme sus consultas"}
          </p>
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-5">
          {/* Contact information */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold mb-4">
              {lang === "en" ? "Contact Information" : "Información de Contacto"}
            </h2>

            <div className="grid gap-4">
              {/* Contact cards */}
              <ContactCard
                icon={<MessageSquare className="w-5 h-5" />}
                title="WhatsApp"
                content="+54 9 11 6839-0473"
                href="https://wa.me/5491168390473"
              />

              <ContactCard
                icon={<Mail className="w-5 h-5" />}
                title={lang === "en" ? "Email" : "Correo"}
                content="dra.renomartu@gmail.com"
                href="mailto:dra.renomartu@gmail.com"
              />

              <ContactCard
                icon={<Clock className="w-5 h-5" />}
                title={lang === "en" ? "Office Hours" : "Horario"}
                content={lang === "en" ? "Mon-Fri: 9:00-18:00" : "Lun-Vie: 9:00-18:00"}
              />

              <ContactCard
                icon={<MapPin className="w-5 h-5" />}
                title={lang === "en" ? "Office Location" : "Ubicación"}
                content={
                  <div className="space-y-1">
                    <p>Ciudad Autónoma de Buenos Aires</p>
                    <p>Argentina</p>
                  </div>
                }
              />
            </div>

            {/* Additional information - Corregido el botón de WhatsApp */}
            <div className="mt-8 bg-muted/50 p-5 rounded-xl">
              <h3 className="font-medium mb-2">
                {lang === "en" ? "Need immediate assistance?" : "¿Necesita asistencia inmediata?"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {lang === "en"
                  ? "For urgent matters, please contact me directly via WhatsApp or email."
                  : "Para asuntos urgentes, contácteme directamente por WhatsApp o correo electrónico."}
              </p>
              <Button
                variant="outline"
                className="w-full bg-background hover:bg-black hover:text-white transition-colors"
                asChild
              >
                <a
                  href="https://wa.me/5491168390473"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === "en" ? "Message on WhatsApp" : "Mensaje por WhatsApp"}</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-muted shadow-sm">
              <CardContent className="p-0">
                <div className="bg-primary/10 p-6 border-b">
                  <h2 className="text-xl font-semibold">{lang === "en" ? "Send a Message" : "Enviar un Mensaje"}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {lang === "en"
                      ? "Fill out the form below and I'll get back to you as soon as possible."
                      : "Complete el formulario a continuación y me pondré en contacto lo antes posible."}
                  </p>
                </div>

                <form className="p-6 space-y-5" onSubmit={handleSubmit} method="POST">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        {lang === "en" ? "First Name" : "Nombre"}
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder={lang === "en" ? "Enter your first name" : "Ingrese su nombre"}
                        type="text"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        {lang === "en" ? "Last Name" : "Apellido"}
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder={lang === "en" ? "Enter your last name" : "Ingrese su apellido"}
                        type="text"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {lang === "en" ? "Email" : "Correo electrónico"}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      placeholder={lang === "en" ? "Enter your email" : "Ingrese su correo electrónico"}
                      type="email"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      {lang === "en" ? "Phone" : "Teléfono"}
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder={lang === "en" ? "Enter your phone number" : "Ingrese su número de teléfono"}
                      type="tel"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      {lang === "en" ? "Message" : "Mensaje"}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={lang === "en" ? "How can I help you?" : "¿Cómo puedo ayudarle?"}
                      className="min-h-[150px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        {lang === "en" ? "Sending..." : "Enviando..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {lang === "en" ? "Send Message" : "Enviar Mensaje"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Contact card component
function ContactCard({
  icon,
  title,
  content,
  href,
}: {
  icon: React.ReactNode
  title: string
  content: React.ReactNode
  href?: string
}) {
  const inner = (
    <>
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">{icon}</div>
      <div>
        <h3 className="font-medium text-base">{title}</h3>
        <div className="text-muted-foreground mt-1">{content}</div>
      </div>
    </>
  )

  return (
    <Card className="group hover:shadow-md transition-all rounded-xl overflow-hidden">
      <CardContent className="p-4 flex items-start gap-3">
        {href ? (
          <a
            href={href}
            className="flex items-start gap-3 w-full hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </CardContent>
    </Card>
  )
}

