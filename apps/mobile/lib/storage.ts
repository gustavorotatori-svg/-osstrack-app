import * as SecureStore from "expo-secure-store"

const TOKEN_KEY = "osstrack_token"
const USER_KEY = "osstrack_user"

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function saveUser(user: any) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

export async function getUser(): Promise<any | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function deleteUser() {
  await SecureStore.deleteItemAsync(USER_KEY)
}

export async function clearAuth() {
  await deleteToken()
  await deleteUser()
}
