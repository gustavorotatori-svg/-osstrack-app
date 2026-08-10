import { ImageResponse } from "next/og"

export const alt = "OssTrack — Gestão gratuita de academias de Jiu-Jitsu"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 28%, #2a2416 0%, #0d0d0d 55%, #090909 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 999,
              border: "2px solid #d4a847",
              color: "#d4a847",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            100% GRÁTIS
          </div>
        </div>
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -4, display: "flex", lineHeight: 1 }}>
          <span style={{ color: "#f5f5f0" }}>Oss</span>
          <span
            style={{
              background: "linear-gradient(135deg,#f6d98a,#d4a847 55%,#a67c2e)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Track
          </span>
        </div>
        <div style={{ fontSize: 38, color: "#c9c4b8", marginTop: 26, textAlign: "center", padding: "0 80px", fontWeight: 500 }}>
          Gestão gratuita de academias de Jiu-Jitsu
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 44, color: "#8f8a7f", fontSize: 24, fontWeight: 500 }}>
          {["Check-in", "Faixas", "Ranking", "Financeiro"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#d4a847" }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
