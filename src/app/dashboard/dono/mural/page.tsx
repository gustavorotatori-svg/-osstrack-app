"use client"

import MuralFeed from "@/components/mural/mural-feed"
import { BackButton } from "@/components/ui/back-button"

export default function DonoMuralPage() {
  return (
    <>
      <BackButton href="/dashboard/dono" />
      <MuralFeed role="dono" />
    </>
  )
}
