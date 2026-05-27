"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode, createContext, useContext, useState, useEffect } from "react"
import { Toaster } from "sonner"
import type { Locale } from "@/lib/i18n"

type Theme = "dark" | "light"

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
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light")
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("osstrack_theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("osstrack_locale", locale)
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
  }

  return (
    <SessionProvider>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((p) => (p === "dark" ? "light" : "dark")) }}>
          {mounted ? children : <div className="min-h-screen bg-[#0a0a0a]" />}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#111',
                border: '1px solid #1e1e1e',
                color: '#fff',
                borderRadius: '12px',
              },
            }}
          />
        </ThemeContext.Provider>
      </LocaleContext.Provider>
    </SessionProvider>
  )
}
