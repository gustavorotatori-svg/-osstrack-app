import { PrismaClient } from '@prisma/client'

const prisma = globalThis.prisma ?? new PrismaClient()

if (!globalThis.prisma) globalThis.prisma = prisma

export default prisma
