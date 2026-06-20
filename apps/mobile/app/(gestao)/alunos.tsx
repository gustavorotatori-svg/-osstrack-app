import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, TextInput, Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api, getBeltEmoji } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")

  async function load() {
    const res = await api.getAlunos()
    if (res.ok) setAlunos(res.data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const filtered = alunos.filter((a) =>
    a.nome?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center", paddingTop: 60 }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <View style={theme.container}>
      {/* Header */}
      <View style={{ padding: 16, paddingTop: 60, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>ALUNOS</Text>
            <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>{alunos.length} total</Text>
          </View>
          <TouchableOpacity
            style={[theme.button, { padding: 12, borderRadius: 12 }]}
            onPress={() => router.push("/aluno/novo")}
          >
            <Ionicons name="add" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[theme.input, { marginBottom: 4 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar aluno..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {filtered.length === 0 ? (
          <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              {search ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
            </Text>
          </View>
        ) : (
          filtered.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[theme.card, { flexDirection: "row", alignItems: "center", marginBottom: 8 }]}
              onPress={() => Alert.alert(a.nome, `Faixa: ${a.faixa}\nGrau: ${a.grau + 1}\nCategoria: ${a.categoria || "—"}`)}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: `${colors.gold}15`,
                justifyContent: "center", alignItems: "center",
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 18 }}>{getBeltEmoji(a.faixa)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{a.nome}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {a.faixa} · {a.grau + 1}º grau{a.categoria ? ` · ${a.categoria}` : ""}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}
