import { useEffect } from "react"

export function useEscape(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handler()
    }

    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [handler, enabled])
}