import { useMemo } from "react"
import { useLocale } from "@/components/layout/providers"
import { t } from "@/lib/i18n"

export function useT(namespace?: string) {
  const { locale } = useLocale()
  return useMemo(
    () => (key: string) => t(locale, namespace ? `${namespace}.${key}` : key),
    [locale, namespace]
  )
}
