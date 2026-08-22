const { PrismaClient } = require("@prisma/client")
const p = new PrismaClient()
p.rateLimitAttempt.deleteMany().then(() => console.log("Rate limits limpos")).finally(() => p.$disconnect())
