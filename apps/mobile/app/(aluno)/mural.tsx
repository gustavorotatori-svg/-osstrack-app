import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api, formatDate, getBeltEmoji } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"

export default function MuralScreen() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const res = await api.getMural()
    if (res.ok) setPosts(res.data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  async function curtir(postId: string) {
    await api.curtirPostagem(postId)
    load()
  }

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
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>MURAL</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>Atividades</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {posts.length === 0 ? (
          <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
            <Ionicons name="newspaper-outline" size={40} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14 }}>
              Nenhuma atividade ainda
            </Text>
          </View>
        ) : (
          posts.map((p: any) => (
            <View key={p.id} style={[theme.card, { marginBottom: 10 }]}>
              {/* Author row */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: `${colors.gold}10`,
                  justifyContent: "center", alignItems: "center", marginRight: 10,
                }}>
                  <Text style={{ fontSize: 16 }}>{getBeltEmoji(p.autorFaixa || p.faixa)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                    {p.autorNome || p.nome}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    {p.createdAt ? formatDate(p.createdAt) : ""}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                {p.conteudo}
              </Text>

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  onPress={() => curtir(p.id)}
                >
                  <Ionicons
                    name={p.curtido ? "heart" : "heart-outline"}
                    size={16}
                    color={p.curtido ? colors.red : colors.textMuted}
                  />
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{p.likes || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
