import { PhoneIcon as WhatsappLogo } from "lucide-react"
import { Button } from "./ui/button"

export function FloatingWhatsApp({ phone = "5491112345678" }: { phone?: string }) {
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-4 md:bottom-8 md:right-8 z-50"
    >
      <Button
        size="lg"
        className="rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-lg hover:shadow-xl transition-all duration-300 w-14 h-14"
      >
        <WhatsappLogo className="w-7 h-7" />
        <span className="sr-only">Contact on WhatsApp</span>
      </Button>
    </a>
  )
}

