export type UserRole = "aluno" | "professor" | "dono"

export function isUserRole(value: string): value is UserRole {
  return ["aluno", "professor", "dono"].includes(value)
}
