"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"
import { InstallPrompt, useInstall } from "@/components/pwa/install-prompt"

type RoleType = "aluno" | "professor" | "dono"

const ROLE_CARDS: { role: RoleType; icon: string; title: string; desc: string; color: string }[] = [
  { role: "aluno", icon: "🥋", title: "Aluno", desc: "Quero treinar e acompanhar minha evolução no Jiu-Jitsu", color: "#3b82f6" },
  { role: "professor", icon: "👨‍🏫", title: "Professor", desc: "Sou faixa preta ou graduado e quero gerenciar alunos", color: "#9333ea" },
  { role: "dono", icon: "🏛️", title: "Dono de Academia", desc: "Tenho minha própria academia e quero administrar tudo", color: "#d4a847" },
]

function ProgressDots({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1
        const isActive = stepNum === current
        const isDone = stepNum < current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                style={{
                  background: isActive ? "var(--gold)" : isDone ? "rgba(52,211,153,0.2)" : "var(--bg-surface)",
                  color: isActive ? "#000" : isDone ? "#34d399" : "var(--text-muted)",
                  borderColor: isDone ? "rgba(52,211,153,0.3)" : "var(--border)",
                  boxShadow: isActive ? "0 0 12px rgba(212,168,71,0.3)" : "none",
                }}>
                {isDone ? "✓" : stepNum}
              </div>
              <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{
                  color: isActive ? "var(--gold)" : isDone ? "rgba(52,211,153,0.6)" : "var(--text-muted)",
                }}>
                {labels[i] || ""}
              </span>
            </div>
            {i < total - 1 && (
              <div className={`w-6 md:w-8 h-px mb-5 ${isDone ? "bg-emerald-500/30" : "bg-[var(--border)]"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Cadastro() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [roleChosen, setRoleChosen] = useState(false)

  const [form, setForm] = useState({
    nome: "", email: "", telefone: "", dataNascimento: "", senha: "", confirmarSenha: "",
    role: "aluno" as RoleType,
    academiaNome: "", academiaEndereco: "", academiaCidade: "", academiaRaio: 200,
    academiaLat: "", academiaLng: "",
    academiaId: "", professorId: "", codigoConvite: "", skipAcademia: false,
    faixa: "Branca", grau: 0,
    consentimentoTermos: false, consentimentoLGPD: false, consentimentoMarketing: false,
  })

  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<{ id: string; nome: string; cidade: string; estado: string }[]>([])
  const [buscando, setBuscando] = useState(false)
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([])
  const [buscaProf, setBuscaProf] = useState("")
  const [geoLoading, setGeoLoading] = useState(false)
  const buscaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const buscaProfTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { install, isStandalone } = useInstall()

  const t = useT("cadastro")
  const faixas = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
  const TOTAL_STEPS = 2

  const stepLabels: string[] = ["Cadastro", "Finalizar"]

  const roleColor = ROLE_CARDS.find(c => c.role === form.role)?.color || "var(--gold)"

  // URL params
  useEffect(() => {
    const convite = searchParams.get("convite")
    const tipo = searchParams.get("tipo") as RoleType | null
    const academiaId = searchParams.get("academiaId")
    const academiaNome = searchParams.get("academia")
    const professorId = searchParams.get("professorId")
    if (convite) {
      setForm((f) => ({ ...f, codigoConvite: convite, role: tipo || f.role, academiaId: academiaId || f.academiaId }))
      setRoleChosen(true)
    }
    if (academiaNome) setForm((f) => ({ ...f, academiaNome }))
    if (professorId) setForm((f) => ({ ...f, professorId }))
    if (tipo && !convite) {
      setForm((f) => ({ ...f, role: tipo }))
      setRoleChosen(true)
    }
  }, [searchParams])

  // Auto-capture lat/lng for owner
  useEffect(() => {
    if (form.role === "dono" && step === 2 && "geolocation" in navigator) {
      setGeoLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({ ...f, academiaLat: String(pos.coords.latitude), academiaLng: String(pos.coords.longitude) }))
          setGeoLoading(false)
        },
        () => setGeoLoading(false),
        { timeout: 5000, enableHighAccuracy: false }
      )
    }
  }, [form.role, step])

  // Skip role step if already chosen via URL — go to step 2
  useEffect(() => {
    if (roleChosen) setStep(2)
  }, [roleChosen])

  function update(key: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function buscarAcademias(q: string) {
    setBusca(q)
    if (buscaTimer.current) clearTimeout(buscaTimer.current)
    if (q.length < 2) { setResultados([]); return }
    buscaTimer.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const res = await fetch(`/api/academias?q=${encodeURIComponent(q)}`)
        setResultados(await res.json())
      } catch { setResultados([]) }
      setBuscando(false)
    }, 300)
  }

  async function selecionarAcademia(acad: { id: string; nome: string }) {
    setForm((f) => ({ ...f, academiaId: acad.id, academiaNome: acad.nome }))
    setResultados([])
    setBusca("")
    if (form.role === "aluno") {
      try {
        const res = await fetch(`/api/professores?academiaId=${acad.id}`)
        if (res.ok) setProfessores(await res.json())
      } catch {}
    }
  }

  function avancarStep() {
    setStep((s) => s + 1)
    setError("")
  }

  function voltarStep() {
    setStep((s) => Math.max(1, s - 1))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // -- Step validation (no loading for instant transitions) --
    if (step === 1) {
      if (!form.nome.trim()) { setError("Informe seu nome"); return }
      if (!form.email.trim()) { setError("Informe seu email"); return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("E-mail inválido"); return }
      if (form.senha.length < 8) { setError("A senha deve ter no mínimo 8 caracteres"); return }
      if (form.senha !== form.confirmarSenha) { setError("As senhas não conferem"); return }
      if (!form.role) { setError("Selecione um tipo de conta"); return }
      avancarStep(); return
    }

    if (step === 2) {
      if (form.role === "dono" && !form.academiaNome.trim()) {
        setError("Informe o nome da academia"); return
      }
      if (!form.consentimentoTermos || !form.consentimentoLGPD) {
        setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade")
        return
      }
    }

    setLoading(true)

    // -- Submit --
    try {
      let recaptchaToken = ""

      if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        try {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
          if (!(window as any).grecaptcha?.ready) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script")
              script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
              script.onload = () => {
                ;(window as any).grecaptcha.ready(() => resolve())
              }
              script.onerror = () => reject(new Error("Failed to load reCAPTCHA"))
              document.head.appendChild(script)
            })
          } else {
            await new Promise<void>((resolve) => (window as any).grecaptcha.ready(resolve))
          }
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: "register" })
        } catch (e) {
          console.warn("[cadastro] reCAPTCHA error:", e)
        }
      }

      const body: Record<string, unknown> = {
        nome: form.nome, email: form.email, telefone: form.telefone, senha: form.senha,
        dataNascimento: form.dataNascimento || undefined,
        role: form.role, codigoConvite: form.codigoConvite || undefined,
        aceitouTermos: form.consentimentoTermos, aceitouLGPD: form.consentimentoLGPD,
        aceitouMarketing: form.consentimentoMarketing,
        recaptchaToken: recaptchaToken || undefined,
      }
      if (form.professorId) body.professorId = form.professorId
      if (form.role === "dono") {
        body.academia = {
          nome: form.academiaNome, endereco: form.academiaEndereco, cidade: form.academiaCidade,
          raio: form.academiaRaio, lat: form.academiaLat ? Number(form.academiaLat) : undefined,
          lng: form.academiaLng ? Number(form.academiaLng) : undefined,
          modalidades: ["Jiu-Jitsu"],
        }
      } else {
        body.academiaId = form.academiaId || undefined
        body.professorId = body.professorId || form.professorId || undefined
        body.faixa = form.faixa; body.grau = form.grau
      }

      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t("errors.criacao")); setLoading(false); return }

      const result = await signIn("credentials", { email: form.email, password: form.senha, redirect: false })
      if (result?.error) { toast.error("Conta criada! Faça login para continuar."); router.push("/login"); return }

      const ref = searchParams.get("ref")
      if (ref === "ebook") { router.push("/ebook/conteudo"); return }
      if (form.role === "aluno") { router.push("/dashboard/aluno"); return }
      router.push(data.redirect || "/dashboard/aluno")
    } catch {
      setError(t("errors.conexao"))
      setLoading(false)
    }
  }

  function renderStep() {
    // STEP 1: Dados pessoais + Tipo de conta (combined)
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-center">Seus dados</p>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.nomeLabel")}</label>
              <input type="text" className="input" placeholder={t("step1.nomePlaceholder")} required value={form.nome} onChange={(e) => update("nome", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.emailLabel")}</label>
              <input type="email" className="input" placeholder={t("step1.emailPlaceholder")} required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.telefoneLabel")}</label>
                <input type="tel" className="input" placeholder={t("step1.telefonePlaceholder")} required value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.dataNascimentoLabel")}</label>
                <input type="date" className="input" value={form.dataNascimento} onChange={(e) => update("dataNascimento", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step1.senhaLabel")}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className="input w-full pr-9" placeholder="Mín. 8 caracteres" required minLength={8} value={form.senha} onChange={(e) => update("senha", e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Confirmar Senha</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} className="input w-full pr-9" placeholder="Repita a senha" required minLength={8} value={form.confirmarSenha} onChange={(e) => update("confirmarSenha", e.target.value)} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                    {showConfirmPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {form.confirmarSenha && form.senha !== form.confirmarSenha && (
              <p className="text-[10px] text-red-400 -mt-1">As senhas não conferem</p>
            )}
          </div>

          <div className="h-px bg-[var(--border)]" />

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-center">Tipo de conta</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_CARDS.map((card) => {
                const selected = form.role === card.role
                return (
                  <button key={card.role} type="button" onClick={() => update("role", card.role)}
                    className="text-center p-3 rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: selected ? card.color : "var(--border)",
                      background: selected ? `${card.color}10` : "var(--bg-surface)",
                      boxShadow: selected ? `0 0 20px ${card.color}15` : "none",
                    }}>
                    <div className="text-xl mb-1">{card.icon}</div>
                    <div className="text-[10px] font-bold leading-tight" style={{ color: selected ? card.color : "var(--text)" }}>{card.title}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    // STEP 2: Perfil (role-specific) + Termos (combined)
    if (step === 2) {
      return (
        <div className="space-y-4">
          {/* DONO: Criar academia */}
          {form.role === "dono" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] text-center">Cadastre sua academia no OssTrack</p>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.nomeAcademiaLabel")}</label>
                <input type="text" className="input" placeholder={t("step2Dono.nomeAcademiaPlaceholder")} required value={form.academiaNome} onChange={(e) => update("academiaNome", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.enderecoLabel")}</label>
                  <input type="text" className="input" placeholder={t("step2Dono.enderecoPlaceholder")} value={form.academiaEndereco} onChange={(e) => update("academiaEndereco", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Dono.cidadeLabel")}</label>
                  <input type="text" className="input" placeholder={t("step2Dono.cidadePlaceholder")} value={form.academiaCidade} onChange={(e) => update("academiaCidade", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">
                  {t("step2Dono.raioLabel")}
                  <span className="ml-1.5 text-[10px] font-normal text-[var(--text-muted)]">(distância máxima em metros para check-in automático)</span>
                </label>
                <input type="number" className="input" placeholder={t("step2Dono.raioPlaceholder")} value={form.academiaRaio} onChange={(e) => update("academiaRaio", Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" /></svg>
                {geoLoading ? "Capturando localização..." : form.academiaLat ? "📍 Localização capturada automaticamente" : "Localização será usada para check-in por GPS"}
              </div>
              {form.professorId && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-sm text-emerald-400 font-semibold">{t("step2Dono.convidadoProfessor")}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{t("step2Dono.convidadoProfessorDesc")}</p>
                </div>
              )}
            </div>
          )}

          {/* PROFESSOR: Faixa/Grau + Academia */}
          {form.role === "professor" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] text-center">Informe sua graduação e vínculo</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Professor.faixaLabel")}</label>
                  <select className="input" value={form.faixa} onChange={(e) => update("faixa", e.target.value)}>
                    {faixas.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step2Professor.grauLabel")}</label>
                  <select className="input" value={form.grau} onChange={(e) => update("grau", Number(e.target.value))}>
                    {[0, 1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{t("grauOption").replace("{g}", String(g))}</option>)}
                  </select>
                </div>
              </div>
              {!form.academiaId && !form.codigoConvite && (
                <>
                  <div className="h-px bg-[var(--border)]" />
                  <p className="text-xs text-[var(--text-secondary)] text-center">Vincule-se a uma academia (opcional agora)</p>
                  <div className="relative">
                    <input type="text" className="input" placeholder="Buscar academia..." value={busca} onChange={(e) => buscarAcademias(e.target.value)} />
                    {buscando && <span className="absolute right-3 top-3 text-xs" style={{ color: "var(--gold)" }}>Buscando...</span>}
                  </div>
                  {resultados.length > 0 && (
                    <div className="surface overflow-hidden">
                      {resultados.map((acad) => (
                        <button key={acad.id} type="button" className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b border-[var(--border)] last:border-0"
                          onClick={() => selecionarAcademia(acad)}>
                          <span className="text-sm font-medium">{acad.nome}</span>
                          {acad.cidade && <span className="text-xs text-[var(--text-secondary)] ml-2">{acad.cidade}/{acad.estado}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {form.academiaId && (
                <div className="rounded-xl px-4 py-3"
                  style={{
                    background: `${ROLE_CARDS.find(c => c.role === form.role)?.color}12`,
                    borderColor: `${ROLE_CARDS.find(c => c.role === form.role)?.color}30`,
                    border: "1px solid",
                  }}>
                  <p className="text-xs font-semibold"
                    style={{ color: ROLE_CARDS.find(c => c.role === form.role)?.color }}>Academia selecionada</p>
                  <p className="text-sm font-medium">{form.academiaNome}</p>
                </div>
              )}
            </div>
          )}

          {/* ALUNO: Academia + Faixa/Grau + Professor */}
          {form.role === "aluno" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)] text-center">Complete seu perfil de atleta</p>
              {!form.academiaId && !form.codigoConvite && !form.skipAcademia ? (
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Buscar academia</label>
                  <div className="relative">
                    <input type="text" className="input" placeholder="Digite o nome da sua academia..." value={busca} onChange={(e) => buscarAcademias(e.target.value)} />
                    {buscando && <span className="absolute right-3 top-3 text-xs" style={{ color: "var(--gold)" }}>Buscando...</span>}
                  </div>
                  {resultados.length > 0 && (
                    <div className="surface overflow-hidden mt-2">
                      {resultados.map((acad) => (
                        <button key={acad.id} type="button" className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b border-[var(--border)] last:border-0"
                          onClick={() => selecionarAcademia(acad)}>
                          <span className="text-sm font-medium">{acad.nome}</span>
                          {acad.cidade && <span className="text-xs text-[var(--text-secondary)] ml-2">{acad.cidade}/{acad.estado}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] text-center pt-2">
                    <button type="button" onClick={() => { setForm((f) => ({ ...f, skipAcademia: true })) }}
                      className="text-[var(--gold)] font-semibold hover:underline">
                      Não encontrei minha academia
                    </button>
                  </p>
                </div>
              ) : !form.academiaId && !form.codigoConvite && form.skipAcademia ? (
                <div className="bg-[rgba(255,255,255,0.02)] border border-dashed border-[var(--border)] rounded-xl px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">Você pode vincular uma academia depois</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Vá em Perfil → Editar para buscar sua academia mais tarde</p>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, skipAcademia: false }))}
                    className="text-[10px] text-[var(--gold)] font-semibold hover:underline mt-2 inline-block">
                    Buscar novamente
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--gold-dim)] border border-[var(--gold)]/30 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>Academia</p>
                  <p className="text-sm font-medium">{form.academiaNome}</p>
                </div>
              )}
              <div className="h-px bg-[var(--border)]" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step3Aluno.faixaLabel")}</label>
                  <select className="input" value={form.faixa} onChange={(e) => { update("faixa", e.target.value); update("grau", 0) }}>
                    {faixas.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("step3Aluno.grauLabel")}</label>
                  <select className="input" value={form.grau} onChange={(e) => update("grau", Number(e.target.value))}>
                    {[0, 1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{t("step3Aluno.grauOption").replace("{g}", String(g))}</option>)}
                  </select>
                </div>
              </div>
              {form.academiaId && (
                <>
                  <div className="h-px bg-[var(--border)]" />
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Professor (opcional)</label>
                    <div className="relative">
                      <input type="text" className="input" placeholder="Buscar professor..." value={buscaProf}
                        onChange={(e) => {
                          setBuscaProf(e.target.value)
                          if (buscaProfTimer.current) clearTimeout(buscaProfTimer.current)
                          if (e.target.value.length < 2) { setProfessores([]); return }
                          buscaProfTimer.current = setTimeout(async () => {
                            try {
                              const res = await fetch(`/api/professores?q=${encodeURIComponent(e.target.value)}&academiaId=${form.academiaId}`)
                              setProfessores(await res.json())
                            } catch { setProfessores([]) }
                          }, 300)
                        }} />
                    </div>
                    {professores.length > 0 && (
                      <div className="surface overflow-hidden mt-2">
                        {professores.map((prof) => (
                          <button key={prof.id} type="button" className="w-full text-left px-4 py-3 hover:opacity-80 transition-colors border-b border-[var(--border)] last:border-0"
                            onClick={() => { update("professorId", prof.id); setProfessores([]); setBuscaProf(prof.nome) }}>
                            {prof.nome}
                          </button>
                        ))}
                      </div>
                    )}
                    {form.professorId && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mt-2">
                        <p className="text-xs text-emerald-400 font-semibold">Professor selecionado</p>
                        <p className="text-sm font-medium">{buscaProf}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="h-px bg-[var(--border)]" />

          {/* Terms (contained at the bottom of step 2) */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.consentimentoTermos} onChange={(e) => update("consentimentoTermos", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--gold)]" />
              <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">
                Aceito os <Link href="/termos" target="_blank" className="text-[var(--gold)] font-semibold hover:underline">Termos de Uso</Link> e a{" "}
                <Link href="/lgpd" target="_blank" className="text-[var(--gold)] font-semibold hover:underline">Política de Privacidade</Link> *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.consentimentoLGPD} onChange={(e) => update("consentimentoLGPD", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--gold)]" />
              <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">
                Autorizo o tratamento dos meus dados pessoais conforme a LGPD (Lei 13.709/2018) *
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.consentimentoMarketing} onChange={(e) => update("consentimentoMarketing", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[var(--gold)]" />
              <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">
                Aceito receber comunicações sobre novidades, dicas e promoções (opcional)
              </span>
            </label>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,rgba(201,122,46,0.03)_40%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <button onClick={() => step === 1 ? router.push("/") : voltarStep()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] bg-[var(--bg-surface)] hover:bg-[var(--border)] px-3 py-1.5 rounded-full transition-all mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          {step === 1 ? "Voltar ao início" : "Voltar"}
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg"
            style={{ background: roleColor, color: "#000" }}>
            🥋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: roleColor }}>{t("title")}</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>
            {step === 1 ? "Crie sua conta em menos de 1 minuto" : "Finalize seu cadastro"}
          </p>
        </div>

        <ProgressDots current={step} total={TOTAL_STEPS} labels={stepLabels} />

        <form onSubmit={handleSubmit} className="glass-card p-5 md:p-7 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="text-xs text-red-400 bg-[var(--red-dim)] border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button type="button" onClick={voltarStep}
                className="btn flex-1 py-3 text-sm"
                style={{ background: "var(--bg-surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
                Voltar
              </button>
            )}
            <button type="submit" disabled={loading}
              className={`btn flex-1 py-3 text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={loading ? { background: "var(--border)", color: "var(--text-muted)" } : { background: "var(--gold)", color: "#000", fontWeight: 700 }}>
              {loading ? "Criando conta..." : step === 1 ? "Próximo" : "Criar Conta Grátis"}
            </button>
          </div>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "var(--gold)" }} className="font-semibold">Entrar</Link>
          </p>
        </form>

        {!isStandalone && (
          <div className="text-center mt-4">
            <button onClick={install}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Instalar App
            </button>
          </div>
        )}
      </div>
      <InstallPrompt />
    </div>
  )
}
