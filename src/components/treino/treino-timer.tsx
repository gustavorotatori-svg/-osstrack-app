"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useT } from "@/lib/use-t"
import { DumbbellIcon, RefreshIcon } from "@/components/ui/icons"

type Fase = "preparacao" | "round" | "descanso" | "concluido"

interface RoundConfig {
  roundMin: number; roundSeg: number
  descansoMin: number; descansoSeg: number
  totalRounds: number
  som: boolean
}

function beep(ctx: AudioContext | null, freq: number, duration: number, volume = 0.3) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function toSeg(m: number, s: number) { return m * 60 + s }

export function TreinoTimer() {
  const t = useT("aluno.treino")
  const [config, setConfig] = useState<RoundConfig>({
    roundMin: 5, roundSeg: 0, descansoMin: 1, descansoSeg: 0, totalRounds: 5, som: true,
  })
  const [running, setRunning] = useState(false)
  const [fase, setFase] = useState<Fase>("preparacao")
  const [roundAtual, setRoundAtual] = useState(1)
  const [tempoRestante, setTempoRestante] = useState(0)
  const [tempoTotal, setTempoTotal] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => { ctxRef.current?.close() }
  }, [])

  const tocarAlerta = useCallback((tipo: "inicio" | "fim" | "ultimos10" | "preparacao") => {
    if (!config.som) return
    const ctx = ctxRef.current
    if (tipo === "preparacao") { beep(ctx, 440, 0.15, 0.2); return }
    if (tipo === "inicio") { beep(ctx, 880, 0.3, 0.4); return }
    if (tipo === "ultimos10") { beep(ctx, 660, 0.1, 0.25); return }
    if (tipo === "fim") {
      beep(ctx, 440, 0.15, 0.4)
      setTimeout(() => beep(ctx, 550, 0.15, 0.4), 200)
      setTimeout(() => beep(ctx, 660, 0.3, 0.5), 400)
      return
    }
  }, [config.som])

  function iniciar() {
    if (running) return
    if (fase === "concluido") {
      setRoundAtual(1)
      setFase("preparacao")
      setTempoRestante(5)
      setTempoTotal(5)
      return
    }
    setRunning(true)
    const seg = toSeg(config.roundMin, config.roundSeg)
    setTempoRestante(seg)
    setTempoTotal(seg)
    setFase("round")
    setRoundAtual(1)
    tocarAlerta("inicio")
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          if (fase === "round") {
            tocarAlerta("fim")
            if (roundAtual >= config.totalRounds) {
              setFase("concluido")
              setRunning(false)
              return 0
            }
            const seg = toSeg(config.descansoMin, config.descansoSeg)
            setFase("descanso")
            setTempoTotal(seg)
            tocarAlerta("inicio")
            return seg
          }
          if (fase === "descanso") {
            const segs = toSeg(config.roundMin, config.roundSeg)
            setRoundAtual((r) => r + 1)
            setFase("round")
            setTempoTotal(segs)
            tocarAlerta("inicio")
            return segs
          }
          return 0
        }
        if (prev <= 11 && prev > 1 && fase === "round") tocarAlerta("ultimos10")
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, fase, roundAtual, config, tocarAlerta])

  function parar() { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }
  function resetar() { parar(); setFase("preparacao"); setRoundAtual(1); setTempoRestante(0); setTempoTotal(0) }

  const minutos = Math.floor(tempoRestante / 60)
  const segundos = tempoRestante % 60
  const progresso = tempoTotal > 0 ? (tempoRestante / tempoTotal) * 100 : 0

  const labelFase = {
    preparacao: t("title"), round: `Round ${roundAtual}/${config.totalRounds}`,
    descanso: t("descanso"), concluido: t("concluido"),
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Config */}
      {!running && fase !== "concluido" && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          <div>
            <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Round</label>
            <div className="flex gap-1 mt-1">
              <input type="number" min={1} max={59} value={config.roundMin} onChange={(e) => setConfig((c) => ({ ...c, roundMin: +e.target.value }))} className="input-premium text-center w-full text-sm" />
              <span className="text-xs text-[var(--gray)] self-center">:</span>
              <input type="number" min={0} max={59} value={config.roundSeg} onChange={(e) => setConfig((c) => ({ ...c, roundSeg: +e.target.value }))} className="input-premium text-center w-full text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Descanso</label>
            <div className="flex gap-1 mt-1">
              <input type="number" min={0} max={5} value={config.descansoMin} onChange={(e) => setConfig((c) => ({ ...c, descansoMin: +e.target.value }))} className="input-premium text-center w-full text-sm" />
              <span className="text-xs text-[var(--gray)] self-center">:</span>
              <input type="number" min={0} max={59} value={config.descansoSeg} onChange={(e) => setConfig((c) => ({ ...c, descansoSeg: +e.target.value }))} className="input-premium text-center w-full text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Rounds</label>
            <input type="number" min={1} max={20} value={config.totalRounds} onChange={(e) => setConfig((c) => ({ ...c, totalRounds: +e.target.value }))} className="input-premium text-center w-full text-sm mt-1" />
          </div>
        </div>
      )}

      {/* Timer display */}
      <div className="relative w-56 h-56">
        <svg className="w-56 h-56 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--dark-border)" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={
            fase === "descanso" ? "#10b981" : fase === "concluido" ? "var(--gold)" : "var(--gold)"
          } strokeWidth="4" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - progresso / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {fase === "preparacao" ? (
            <div className="text-center">
              <DumbbellIcon className="w-10 h-10 mb-2 mx-auto" />
              <p className="text-xs text-[var(--white-muted)]">{t("subtitle")}</p>
            </div>
          ) : (
            <>
              <div className={`text-5xl font-black tracking-tight ${fase === "descanso" ? "text-emerald-500" : fase === "concluido" ? "gradient-gold-text" : "text-white"}`}>
                {String(minutos).padStart(2, "0")}:{String(segundos).padStart(2, "0")}
              </div>
              <div className={`text-xs font-semibold mt-1 ${fase === "descanso" ? "text-emerald-500" : "text-[var(--white-muted)]"}`}>
                {labelFase[fase]}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3">
        {fase !== "concluido" && (
          running ? (
            <button onClick={parar} className="w-14 h-14 rounded-full bg-red-600/80 text-white flex items-center justify-center text-lg hover:bg-red-600 transition-all active:scale-90">
              ⏸
            </button>
          ) : (
            <button onClick={iniciar} className="w-14 h-14 rounded-full gradient-gold text-black flex items-center justify-center text-lg hover:scale-110 transition-all active:scale-90 shadow-lg">
              ▶
            </button>
          )
        )}
        {fase === "concluido" && (
          <button onClick={iniciar} className="btn-gold px-8 py-3 text-sm font-bold">
            <RefreshIcon className="w-4 h-4 inline -mt-0.5 mr-1" /> Novo Treino
          </button>
        )}
        <button onClick={resetar} className="w-10 h-10 rounded-full bg-[var(--dark-border)] text-[var(--white-muted)] flex items-center justify-center text-xs hover:text-white transition-all">
          ↺
        </button>
      </div>

      {/* Som toggle */}
      <label className="flex items-center gap-2 text-xs text-[var(--white-muted)]">
        <input type="checkbox" checked={config.som} onChange={(e) => setConfig((c) => ({ ...c, som: e.target.checked }))} className="accent-[var(--gold)]" />
        Alertas sonoros
      </label>

      {/* Rounds dots */}
      {running && (
        <div className="flex gap-2">
          {Array.from({ length: config.totalRounds }, (_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${
              i + 1 < roundAtual ? "bg-emerald-500"
              : i + 1 === roundAtual ? (fase === "descanso" ? "bg-emerald-500/50" : "bg-[var(--gold)]")
              : "bg-[var(--dark-border)]"
            }`} />
          ))}
        </div>
      )}
    </div>
  )
}
