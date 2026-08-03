import { seedTestUsers } from "./helpers"

export default async function globalSetup() {
  await seedTestUsers()
}
