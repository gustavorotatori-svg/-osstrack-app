import { Tabs } from "expo-router"
import { colors } from "@/lib/theme"
import { Text } from "react-native"

export default function GestaoTabLayout() {
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
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text> }} />
      <Tabs.Screen name="alunos" options={{ title: "Alunos", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👥</Text> }} />
      <Tabs.Screen name="presencas" options={{ title: "Presenças", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>✅</Text> }} />
      <Tabs.Screen name="turmas" options={{ title: "Turmas", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📅</Text> }} />
      <Tabs.Screen name="financeiro" options={{ title: "Financeiro", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text> }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }} />
    </Tabs>
  )
}
