import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api, formatDate, getBeltEmoji } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function PresencasScreen() {
  const [presencas, setPresencas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const res = await api.getPresencas()
    if (res.ok) setPresencas(res.data || [])
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
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>PRESENÇAS</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>Hoje</Text>

        <TouchableOpacity
          style={[theme.button, { marginTop: 12, flexDirection: "row", gap: 8 }]}
          onPress={() => router.push("/checkin/qr")}
        >
          <Ionicons name="qr-code" size={18} color="#000" />
          <Text style={theme.buttonText}>Escanear QR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {presencas.length === 0 ? (
          <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              Nenhuma presença hoje
            </Text>
          </View>
        ) : (
          presencas.slice(0, 50).map((p: any) => (
            <View key={p.id} style={[theme.card, {
              flexDirection: "row", alignItems: "center", marginBottom: 6,
              borderLeftWidth: 3,
              borderLeftColor: p.status === "confirmed" ? colors.green : colors.orange,
            }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{p.aluno || p.alunoNome}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {p.data ? formatDate(p.data) : ""} {p.horario ? `às ${p.horario}` : ""}
                </Text>
              </View>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                backgroundColor: p.status === "confirmed" ? `${colors.green}15` : `${colors.orange}15`,
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: p.status === "confirmed" ? colors.green : colors.orange }}>
                  {p.status === "confirmed" ? "CONFIRMADO" : "PENDENTE"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
