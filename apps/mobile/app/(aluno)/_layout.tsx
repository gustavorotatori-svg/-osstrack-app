import { Tabs } from "expo-router"
import { colors } from "@/lib/theme"
import { Text } from "react-native"

export default function AlunoTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0d0d",
          borderTopColor: "rgba(255,255,255,0.06)",
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text> }} />
      <Tabs.Screen name="treino" options={{ title: "Treino", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💪</Text> }} />
      <Tabs.Screen name="mural" options={{ title: "Mural", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📢</Text> }} />
      <Tabs.Screen name="ranking" options={{ title: "Ranking", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏆</Text> }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }} />
    </Tabs>
  )
}
