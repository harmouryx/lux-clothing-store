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
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-500" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans text-xs font-medium rounded-2xl border border-border/80 bg-background/85 dark:bg-card/85 backdrop-blur-xl shadow-lg text-foreground p-3.5 flex items-center gap-3 transition-all",
          description: "text-[11px] text-muted-foreground",
          actionButton: "bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg",
          cancelButton: "bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
