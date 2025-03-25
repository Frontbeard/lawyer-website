import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"

export function QuickContactForm({ lang }: { lang: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Usando Formspree
      const response = await fetch("https://formspree.io/f/xrbpqkdg", {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        toast.success(
          lang === "en"
            ? "Message sent successfully! We'll contact you soon."
            : "¡Mensaje enviado con éxito! Martina Renó se contactará pronto.",
        )
        const form = event.target as HTMLFormElement
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
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white/90 dark:bg-black/90 p-6 rounded-3xl backdrop-blur-sm"
      method="POST"
    >
      <Input
        name="name"
        placeholder={lang === "en" ? "Name" : "Nombre"}
        required
        className="bg-white dark:bg-gray-950"
        disabled={isLoading}
      />
      <Input
        type="email"
        name="email"
        placeholder={lang === "en" ? "Email" : "Correo"}
        required
        className="bg-white dark:bg-gray-950"
        disabled={isLoading}
      />
      <Textarea
        name="message"
        placeholder={lang === "en" ? "Message" : "Mensaje"}
        required
        className="bg-white dark:bg-gray-950 min-h-[100px]"
        disabled={isLoading}
      />
      <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={isLoading}>
        {isLoading ? (
          <span className="animate-pulse">{lang === "en" ? "Sending..." : "Enviando..."}</span>
        ) : lang === "en" ? (
          "Send message"
        ) : (
          "Enviar mensaje"
        )}
      </Button>
    </form>
  )
}

