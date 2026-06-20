import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"

export default function TurmasScreen() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const res = await api.getTurmas()
    if (res.ok) setTurmas(res.data || [])
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
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>TURMAS</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>{turmas.length} turmas</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {turmas.length === 0 ? (
          <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              Nenhuma turma cadastrada
            </Text>
          </View>
        ) : (
          turmas.map((t: any) => (
            <TouchableOpacity key={t.id} style={[theme.card, { marginBottom: 8 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{t.nome}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
              {t.descricao && (
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{t.descricao}</Text>
              )}
              {t.horarios && t.horarios.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {t.horarios.map((h: string, i: number) => (
                    <View key={i} style={{
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      backgroundColor: `${colors.gold}10`,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: "600", color: colors.gold }}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}
