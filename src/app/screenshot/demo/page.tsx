import { ScreenshotDemo } from "./client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OssTrack Demo",
  robots: { index: false, follow: true },
}

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <ScreenshotDemo />
    </div>
  )
}
