import * as React from "react"
import { cn } from "../../lib/utils"

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              open: isOpen,
              onOpenChange: handleOpenChange,
            })
          }
          return child
        })}
      </div>
    )
  },
)
Sheet.displayName = "Sheet"

interface SheetTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, children, open, onOpenChange, asChild = false, ...props }, ref) => {
    const handleClick = () => {
      onOpenChange?.(!open)
    }

    const Comp = asChild ? React.Children.only(children) : "button"

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        onClick: handleClick,
        ...props,
      })
    }

    return (
      <button ref={ref} className={cn("", className)} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  },
)
SheetTrigger.displayName = "SheetTrigger"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    React.useEffect(() => {
      // Bloquear el scroll del body cuando el sheet está abierto
      if (open) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }

      return () => {
        document.body.style.overflow = ""
      }
    }, [open])

    if (!open) return null

    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => onOpenChange?.(false)}
        />
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 right-0 z-50 bg-background shadow-lg transition-transform duration-300 ease-in-out",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  },
)
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetContent }

