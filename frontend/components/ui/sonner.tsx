"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      visibleToasts={1}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-xs font-medium rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl p-4 flex items-center gap-3 transition-all",
          description: "text-[11px] text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
