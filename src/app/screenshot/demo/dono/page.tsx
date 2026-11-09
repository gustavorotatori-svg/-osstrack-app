import { DonoScreenshotDemo } from "./client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OssTrack Dono Demo",
  robots: { index: false, follow: true },
}

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <DonoScreenshotDemo />
    </div>
  )
}
