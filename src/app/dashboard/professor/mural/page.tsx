"use client"

import MuralFeed from "@/components/mural/mural-feed"
import { BackButton } from "@/components/ui/back-button"

export default function ProfessorMuralPage() {
  return (
    <>
      <BackButton href="/dashboard/professor" />
      <MuralFeed role="professor" />
    </>
  )
}
