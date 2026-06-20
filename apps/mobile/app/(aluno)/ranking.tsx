import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api, getBeltEmoji } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"

export default function RankingScreen() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const res = await api.getRanking()
    if (res.ok) setRanking(res.data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center", paddingTop: 60 }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <View style={theme.container}>
      <View style={{ padding: 16, paddingTop: 60, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>RANKING</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>
          {ranking.length} alunos
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {ranking.length === 0 ? (
          <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
            <Ionicons name="trophy-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              Ranking não disponível
            </Text>
          </View>
        ) : (
          ranking.map((r: any, i: number) => (
            <View key={r.id || i} style={[theme.card, {
              flexDirection: "row", alignItems: "center", marginBottom: 6,
              borderLeftWidth: 3,
              borderLeftColor: i === 0 ? colors.gold : i < 3 ? colors.beltRoxa : colors.border,
            }]}>
              <View style={{ width: 32, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "900", color: i < 3 ? colors.gold : colors.textMuted }}>
                  {i + 1}
                </Text>
              </View>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: `${colors.gold}10`,
                justifyContent: "center", alignItems: "center",
                marginRight: 10,
              }}>
                <Text style={{ fontSize: 16 }}>{getBeltEmoji(r.faixa)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{r.nome}</Text>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>{r.faixa}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: colors.gold }}>
                {r.presencas || r.total || 0}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
