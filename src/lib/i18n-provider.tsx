import { createContext, useContext, useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import pt from "../../messages/pt.json"
import type { Locale } from "./i18n"

type Messages = Record<string, unknown>

const MessagesContext = createContext<{ messages: Messages; locale: Locale }>({
  messages: pt as Messages,
  locale: "pt",
})

const cache: Partial<Record<Locale, Messages>> = { pt: pt as Messages }

export function loadMessages(locale: Locale): Messages {
  if (cache[locale]) return cache[locale]!
  return pt as Messages
}

export async function loadMessagesAsync(locale: Locale): Promise<Messages> {
  if (cache[locale]) return cache[locale]!
  const mod = await import(`../../messages/${locale}.json`)
  const messages = (mod.default || mod) as Messages
  cache[locale] = messages
  return messages
}

export function TranslationsProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const [messages, setMessages] = useState<Messages>(() => loadMessages(locale))

  useEffect(() => {
    loadMessagesAsync(locale).then(setMessages)
  }, [locale])

  const value = useMemo(() => ({ messages, locale }), [messages, locale])
  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
}

export function useMessages() {
  return useContext(MessagesContext)
}

function getNested(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null) return path
    if (typeof current !== "object") return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : path
}

export function translate(messages: Messages, locale: Locale, key: string): string {
  return getNested(messages, key) || getNested(pt as Messages, key) || key
}
