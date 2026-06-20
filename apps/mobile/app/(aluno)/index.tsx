import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native"
import { api, formatDate, getBeltEmoji, getGreeting } from "@/lib/shared"
import { useAuth } from "@/lib/auth"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function AlunoDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const res = await api.getDashboardAluno()
    if (res.ok) setData(res.data)
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <ScrollView
      style={theme.container}
      contentContainerStyle={{ padding: 16, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
    >
      {/* Header */}
      <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2, marginBottom: 2 }}>
        ALUNO
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: 4 }}>
        {getGreeting()}, {user?.nome?.split(" ")[0]}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
        {getBeltEmoji(user?.faixa || "")} {user?.faixa} · {(user?.grau ?? 0) + 1}º grau
      </Text>

      {/* Quick Stats */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Aulas mês", value: data?.aulasEsteMes ?? 0, color: colors.blue },
          { label: "Total", value: data?.totalAulas ?? 0, color: colors.purple },
          { label: "Streak", value: data?.streak ?? 0, color: (data?.streak ?? 0) >= 3 ? colors.orange : colors.green },
        ].map((s) => (
          <View key={s.label} style={[theme.card, { flex: 1, alignItems: "center", padding: 12 }]}>
            <Text style={[theme.statValue, { fontSize: 20, color: s.color }]}>{s.value}</Text>
            <Text style={theme.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Belt Journey */}
      <View style={[theme.cardAccent, { marginBottom: 12 }]}>
        <Text style={theme.sectionHeader}>Jornada da Faixa</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 2, marginBottom: 12 }}>
          {["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((f, i) => (
            <View key={f} style={{ flex: 1, alignItems: "center" }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center",
                borderWidth: 2,
                borderColor: i < (data?.step || 0) ? colors.gold : colors.border,
                backgroundColor: i < (data?.step || 0) ? `${colors.gold}15` : "transparent",
              }}>
                <Text style={{ fontSize: 16 }}>{getBeltEmoji(f)}</Text>
              </View>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginTop: 2, fontWeight: "600" }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[theme.sectionHeader, { marginTop: 4 }]}>Ações Rápidas</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[
          { label: "Check-in", icon: "✅", href: "/checkin/qr" },
          { label: "Treino", icon: "💪", href: "/treino" },
          { label: "Mural", icon: "📢", href: "/mural" },
          { label: "Ranking", icon: "🏆", href: "/ranking" },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[theme.card, { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, minWidth: "47%" }]}
            onPress={() => router.push(a.href)}
          >
            <Text style={{ fontSize: 16 }}>{a.icon}</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}
