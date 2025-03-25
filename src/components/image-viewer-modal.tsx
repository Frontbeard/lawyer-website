import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  altText?: string
}

export function ImageViewerModal({ isOpen, onClose, imageUrl, altText = "Certificate image" }: ImageViewerModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-white rounded-xl overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 rounded-full bg-white/90 hover:bg-white shadow-md"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="relative w-full aspect-auto md:h-[90vh]">
          <img src={imageUrl || "/placeholder.svg"} alt={altText} className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  )
}

