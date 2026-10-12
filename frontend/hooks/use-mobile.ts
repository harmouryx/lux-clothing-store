import { useSyncExternalStore } from "react"

const MOBILE_QUERY = "(max-width: 767px)"

export function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(MOBILE_QUERY)
      mediaQuery.addEventListener("change", onChange)
      return () => mediaQuery.removeEventListener("change", onChange)
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}
