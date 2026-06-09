export type UserRole = "aluno" | "professor" | "dono"
export type UserPlano = "free" | "trial" | "premium"

export function isUserRole(value: string): value is UserRole {
  return ["aluno", "professor", "dono"].includes(value)
}

export function isUserPlano(value: string): value is UserPlano {
  return ["free", "trial", "premium"].includes(value)
}
