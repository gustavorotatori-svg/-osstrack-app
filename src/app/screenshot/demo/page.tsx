import { ScreenshotDemo } from "./client"

export const metadata = { title: "OssTrack Demo" }

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <ScreenshotDemo />
    </div>
  )
}
