"use client"

export function DonoScreenshotDemo() {
  const stats = [
    { value: "47", label: "Alunos", color: "#60a5fa" },
    { value: "3", label: "Professores", color: "#a855f7" },
    { value: "312", label: "Presenças", color: "#22c55e" },
    { value: "89", label: "Este Mês", color: "#d4a84b" },
  ]

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
  const dados = [180, 210, 195, 245, 290, 312]
  const maxDado = Math.max(...dados, 1)

  const alunos = [
    { nome: "Rafael Oliveira", faixa: "Azul", grau: 2, categoria: "adulto" },
    { nome: "Lucas Santos", faixa: "Branca", grau: 1, categoria: "adulto" },
    { nome: "Pedro Alves", faixa: "Roxa", grau: 1, categoria: "adulto" },
    { nome: "João Lima", faixa: "Marrom", grau: 3, categoria: "adulto" },
    { nome: "Maria Costa", faixa: "Branca", grau: 0, categoria: "adulto" },
    { nome: "Ana Oliveira", faixa: "Azul", grau: 3, categoria: "adulto" },
  ]

  const presencas = [
    { aluno: "Rafael Oliveira", data: "17/06", status: "confirmed" },
    { aluno: "Lucas Santos", data: "17/06", status: "confirmed" },
    { aluno: "Pedro Alves", data: "16/06", status: "confirmed" },
    { aluno: "João Lima", data: "16/06", status: "confirmed" },
    { aluno: "Maria Costa", data: "15/06", status: "confirmed" },
  ]

  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* App bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #d4a84b, #b8912e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#000" }}>O</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>OssTrack</span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>dono</span>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {/* Hero */}
        <div style={{
          padding: "16px 20px", borderRadius: 16, marginBottom: 12,
          background: "linear-gradient(135deg, rgba(212,168,75,0.08) 0%, rgba(212,168,75,0.02) 100%)",
          border: "1px solid rgba(212,168,75,0.1)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#d4a84b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>DONO</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Academia Modelo</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Carlos Silva</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
          {["Turmas", "Alunos", "Presenças", "Graduações"].map((label) => (
            <div key={label} style={{
              padding: "8px 4px", borderRadius: 10, textAlign: "center",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Growth badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12,
          padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#22c55e",
          background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)",
        }}>
          <span>+29% crescimento vs mês anterior</span>
        </div>

        {/* Chart */}
        <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800 }}>Presenças por Mês</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Últimos 6 meses</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72 }}>
            {dados.map((v, i) => {
              const height = Math.max(6, (v / maxDado) * 64)
              const isCurrent = i === dados.length - 1
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{v}</span>
                  <div style={{
                    width: "100%", height, borderRadius: "6px 6px 0 0",
                    background: isCurrent ? "linear-gradient(180deg, #d4a84b 0%, rgba(201,168,76,0.4) 100%)" : "rgba(255,255,255,0.08)",
                  }} />
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>{meses[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alunos section */}
        <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800 }}>Alunos por Faixa</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>6 total</span>
          </div>
          {[
            { faixa: "Branca", count: 2, pct: 33, cor: "#e5e5e5" },
            { faixa: "Azul", count: 2, pct: 33, cor: "#2563eb" },
            { faixa: "Roxa", count: 1, pct: 17, cor: "#9333ea" },
            { faixa: "Marrom", count: 1, pct: 17, cor: "#92400e" },
          ].map((f) => (
            <div key={f.faixa} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, width: 56, flexShrink: 0, color: f.cor }}>
                {f.faixa === "Branca" ? "⬜" : f.faixa === "Azul" ? "🟦" : f.faixa === "Roxa" ? "🟪" : "🟫"} {f.faixa}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>
                <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #d4a84b, #f59e0b)", width: `${f.pct}%` }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", width: 24, textAlign: "right" }}>{f.count}</span>
            </div>
          ))}
        </div>

        {/* Presenças recentes */}
        <div style={{ padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
          <span style={{ fontSize: 11, fontWeight: 800, display: "block", marginBottom: 10 }}>Presenças Recentes</span>
          {presencas.map((p) => (
            <div key={`${p.aluno}-${p.data}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.aluno}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{p.data} · 18:30</div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.15)",
              }}>
                Presente
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
