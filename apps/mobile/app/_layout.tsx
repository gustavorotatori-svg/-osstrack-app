import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider, useAuth } from "@/lib/auth"
import { View, ActivityIndicator } from "react-native"
import { colors } from "@/lib/theme"
import { useEffect } from "react"
import { router } from "expo-router"

function RootNavigator() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      if (user.role === "aluno") {
        router.replace("/(aluno)")
      } else {
        router.replace("/(gestao)")
      }
    } else {
      router.replace("/login")
    }
  }, [user, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(aluno)" />
      <Stack.Screen name="(gestao)" />
      <Stack.Screen name="checkin/qr" options={{ presentation: "modal" }} />
      <Stack.Screen name="aluno/novo" options={{ presentation: "modal" }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  )
}
