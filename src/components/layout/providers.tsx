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

function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("light")) return "light"
    if (document.documentElement.classList.contains("dark")) return "dark"
  }
  return "dark"
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [locale, setLocaleState] = useState<Locale>("pt")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedLocale = localStorage.getItem("osstrack_locale") as Locale | null
    if (storedLocale && ["pt", "en", "es", "fr", "de", "nl", "sv", "ja", "ar", "zh", "hi", "it", "ru", "ko"].includes(storedLocale)) {
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
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
  }

  return (
    <SessionProvider>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((p) => (p === "dark" ? "light" : "dark")) }}>
          {mounted ? children : <div className="min-h-screen" style={{ background: theme === "light" ? "#f5f5f0" : "#0a0a0a" }} />}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: theme === "light" ? '#fff' : '#111',
                border: theme === "light" ? '1px solid #e0e0e0' : '1px solid #1e1e1e',
                color: theme === "light" ? '#1a1a1a' : '#fff',
                borderRadius: '12px',
              },
            }}
          />
        </ThemeContext.Provider>
      </LocaleContext.Provider>
    </SessionProvider>
  )
}
