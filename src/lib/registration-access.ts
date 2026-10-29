import type { Prisma } from "@prisma/client"

export class RegistrationAccessError extends Error {}

// Called inside the same transaction that creates the professor account.
export async function resolveProfessorAccess(
  tx: Prisma.TransactionClient,
  input: { academiaId?: string; codigoConvite?: string; email: string },
) {
  if (input.codigoConvite) {
    const invite = await tx.convite.findUnique({
      where: { codigo: input.codigoConvite },
      include: { remetente: { select: { role: true, academiaId: true } } },
    })
    if (!invite || invite.tipo !== "professor" || invite.usado ||
        (invite.expiresAt && invite.expiresAt <= new Date()) || !invite.academiaId ||
        invite.remetente.role !== "dono" || invite.remetente.academiaId !== invite.academiaId ||
        (input.academiaId && input.academiaId !== invite.academiaId) ||
        (invite.email && invite.email.toLowerCase().trim() !== input.email)) {
      throw new RegistrationAccessError("Convite de professor inválido ou expirado. Solicite um novo convite ao dono da academia.")
    }
    const claimed = await tx.convite.updateMany({
      where: { id: invite.id, usado: false, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      data: { usado: true },
    })
    if (claimed.count !== 1) throw new RegistrationAccessError("Este convite já foi utilizado.")
    return { academiaId: invite.academiaId, approvalOwnerId: null }
  }
  if (input.academiaId) {
    const owner = await tx.usuario.findFirst({ where: { role: "dono", academiaId: input.academiaId }, select: { id: true } })
    if (!owner) throw new RegistrationAccessError("Academia indisponível para vínculo. Peça um convite ao responsável.")
    return { academiaId: null, approvalOwnerId: owner.id }
  }
  return { academiaId: null, approvalOwnerId: null }
}
