import { useMemo } from "react"
import { useLocale } from "@/components/layout/providers"
import { useMessages, translate } from "@/lib/i18n-provider"

export function useT(namespace?: string) {
  const { locale } = useLocale()
  const { messages } = useMessages()
  return useMemo(
    () => (key: string) => translate(messages, locale, namespace ? `${namespace}.${key}` : key),
    [messages, locale, namespace]
  )
}
