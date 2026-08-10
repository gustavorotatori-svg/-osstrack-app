"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react"
import { Toaster } from "sonner"
import type { Locale } from "@/lib/i18n"

type ThemePref = "dark" | "light"
type Theme = "dark" | "light"

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
}>({ locale: "pt", setLocale: () => {} })

const ThemeContext = createContext<{
  theme: Theme
  themePref: ThemePref
  cycleTheme: () => void
}>({ theme: "dark", themePref: "dark", cycleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemePref>("dark")
  const [theme, setTheme] = useState<Theme>("dark")
  const [locale, setLocaleState] = useState<Locale>("pt")
  const [mounted, setMounted] = useState(false)

  const applyTheme = useCallback((t: Theme) => {
    setTheme(t)
    document.documentElement.classList.toggle("light", t === "light")
    document.documentElement.classList.toggle("dark", t === "dark")
  }, [])

  useEffect(() => {
    setMounted(true)
    const storedPref = localStorage.getItem("osstrack_theme_pref")
    if (storedPref === "light") {
      setPref("light")
      setTheme("light")
    }
    const storedLocale = localStorage.getItem("osstrack_locale") as Locale | null
    if (storedLocale && ["pt", "en", "es", "fr", "de", "nl", "sv", "ja", "ar", "zh", "hi", "it", "ru", "ko"].includes(storedLocale)) {
      setLocaleState(storedLocale)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("osstrack_theme_pref", pref)
    applyTheme(pref)
  }, [pref, mounted, applyTheme])

  useEffect(() => {
    localStorage.setItem("osstrack_locale", locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
  }, [locale])

  function setLocale(l: Locale) {
    setLocaleState(l)
  }

  function cycleTheme() {
    setPref((p) => (p === "dark" ? "light" : "dark"))
  }

  return (
    <SessionProvider>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <ThemeContext.Provider value={{ theme, themePref: pref, cycleTheme }}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: '12px',
              },
            }}
          />
        </ThemeContext.Provider>
      </LocaleContext.Provider>
    </SessionProvider>
  )
}
