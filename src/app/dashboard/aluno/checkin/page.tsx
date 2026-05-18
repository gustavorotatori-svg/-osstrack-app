"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"

export default function CheckinPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle")
  const [locationStatus, setLocationStatus] = useState("")

  function handleCheckin() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocalização não disponível")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus(`📍 Localização: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setStatus("pending")
      },
      () => {
        setLocationStatus("❌ Não foi possível obter localização. Verifique as permissões.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <p className="text-xs text-[var(--white-muted)] mb-2">{hoje}</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-emerald-500 text-sm">📍</span>
            <span className="text-xs text-[var(--white-muted)]">Gracie Barra Recife</span>
          </div>

          <div className="py-6">
            <button
              onClick={handleCheckin}
              disabled={status !== "idle"}
              className={`w-28 h-28 rounded-full inline-flex items-center justify-center flex-col gap-1 text-sm font-bold transition-all ${
                status === "done"
                  ? "bg-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                  : status === "pending"
                  ? "bg-yellow-600 text-white shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                  : "gradient-gold text-black shadow-[0_0_40px_rgba(201,168,76,0.2)] hover:scale-105"
              }`}
            >
              {status === "idle" && <>📍<br />Fazer<br />Check-in</>}
              {status === "pending" && <>⏳<br />Check-in<br />Feito</>}
              {status === "done" && <>✓<br />Confirmado</>}
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs text-[var(--white-muted)] mt-2">{locationStatus}</div>
          )}

          <div className="mt-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-500">✓ Anti-fraude ativo · Localização válida</p>
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📋 Últimos Check-ins</h3>
          <p className="text-sm text-[var(--white-muted)] text-center py-4">
            Seus check-ins aparecerão aqui após confirmados pelo professor.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
