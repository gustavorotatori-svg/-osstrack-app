"use client"

import { SessionProvider } from "next-auth/react"
import { NextIntlClientProvider } from "next-intl"
import { ReactNode, createContext, useContext, useState, useEffect } from "react"
import pt from "../../../messages/pt.json"
import en from "../../../messages/en.json"
import es from "../../../messages/es.json"

const messages: Record<string, any> = { pt, en, es }

type Theme = "dark" | "light"

type Locale = "pt" | "en" | "es"

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: "pt", setLocale: () => {} })

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: "dark", toggleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [locale, setLocaleState] = useState<Locale>("pt")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem("osstrack_theme") as Theme | null
    if (storedTheme) setTheme(storedTheme)

    const storedLocale = localStorage.getItem("osstrack_locale") as Locale | null
    if (storedLocale && ["pt", "en", "es"].includes(storedLocale)) {
      setLocaleState(storedLocale)
      document.cookie = `NEXT_LOCALE=${storedLocale};path=/;max-age=31536000`
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light")
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("osstrack_theme", theme)
  }, [theme])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem("osstrack_locale", l)
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000`
    window.location.reload()
  }

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="America/Sao_Paulo">
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((p) => (p === "dark" ? "light" : "dark")) }}>
            {mounted ? children : <div className="min-h-screen bg-[#0a0a0a]" />}
          </ThemeContext.Provider>
        </LocaleContext.Provider>
      </NextIntlClientProvider>
    </SessionProvider>
  )
}
