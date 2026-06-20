import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native"
import { api, formatCurrency, getGreeting } from "@/lib/shared"
import { useAuth } from "@/lib/auth"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function GestaoDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [aniversariantes, setAniversariantes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const [sRes, aRes] = await Promise.all([
      api.getDashboardDono(),
      api.getAniversariantes(),
    ])
    if (sRes.ok) setStats(sRes.data)
    if (aRes.ok) setAniversariantes(aRes.data?.aniversariantes || [])
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
        {user?.role === "dono" ? "DONO" : "PROFESSOR"}
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: 4 }}>
        {getGreeting()}, {user?.nome?.split(" ")[0]}
      </Text>
      {stats?.academia?.nome && (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>
          {stats.academia.nome}
        </Text>
      )}

      {/* Stats Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Alunos", value: stats?.totalAlunos ?? 0, icon: "people", color: colors.blue },
          { label: "Presenças", value: stats?.totalPresencas ?? 0, icon: "checkbox", color: colors.green },
          { label: "Professores", value: stats?.totalProfessores ?? 0, icon: "school", color: colors.purple },
          { label: "Faturamento", value: stats?.faturamentoMes ? formatCurrency(stats.faturamentoMes) : "R$ 0", icon: "cash", color: colors.gold },
        ].map((s) => (
          <View key={s.label} style={[theme.card, { width: "48%", padding: 14 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Ionicons name={s.icon as any} size={16} color={s.color} />
              <Text style={[theme.statLabel, { marginTop: 0 }]}>{s.label}</Text>
            </View>
            <Text style={[theme.statValue, { fontSize: 22 }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={theme.sectionHeader}>Gestão Rápida</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Novo Aluno", icon: "person-add", href: "/aluno/novo", color: colors.blue },
          { label: "Presenças", icon: "checkmark-circle", href: "/(gestao)/presencas", color: colors.green },
          { label: "Turmas", icon: "calendar", href: "/(gestao)/turmas", color: colors.purple },
          { label: "Financeiro", icon: "wallet", href: "/(gestao)/financeiro", color: colors.gold },
          { label: "Graduações", icon: "ribbon", href: "/(gestao)/graduacoes", color: colors.orange },
          { label: "Alunos", icon: "list", href: "/(gestao)/alunos", color: colors.blue },
        ].map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[theme.card, { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, width: "48%" }]}
            onPress={() => router.push(a.href)}
          >
            <Ionicons name={a.icon as any} size={18} color={a.color} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Aniversariantes */}
      {aniversariantes.length > 0 && (
        <View style={[theme.card, { borderTopColor: colors.red, borderTopWidth: 3 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ionicons name="gift" size={16} color={colors.red} />
            <Text style={theme.sectionHeader}>Aniversariantes</Text>
          </View>
          {aniversariantes.slice(0, 5).map((a: any) => (
            <View key={a.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{a.nome}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>Dia {a.dia}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
