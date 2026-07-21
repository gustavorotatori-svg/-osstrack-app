"use client"

import { BackButton } from "@/components/ui/back-button"
import MuralFeed from "@/components/mural/mural-feed"

export default function MuralPage() {
  return (
    <>
      <BackButton href="/dashboard/aluno" />
      <MuralFeed role="aluno" />
    </>
  )
}
