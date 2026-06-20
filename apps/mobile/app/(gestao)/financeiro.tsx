import { useEffect, useState } from "react"
import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { api, formatCurrency } from "@/lib/shared"
import { colors, theme } from "@/lib/theme"

export default function FinanceiroScreen() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const [dashRes, cobRes, planosRes] = await Promise.all([
      api.getFinanceiroDashboard(),
      api.getCobrancas(),
      api.getPlanos(),
    ])
    if (dashRes.ok) setData({ ...dashRes.data, cobrancas: cobRes.ok ? cobRes.data : [], planos: planosRes.ok ? planosRes.data : [] })
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

  const cobrancas = data?.cobrancas || []
  const pendentes = cobrancas.filter((c: any) => c.status === "pendente" || c.status === "atrasada")
  const faturamentoMes = data?.faturamentoMes || 0
  const aReceber = pendentes.reduce((s: number, c: any) => s + c.valor, 0)

  return (
    <View style={theme.container}>
      <View style={{ padding: 16, paddingTop: 60, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>FINANCEIRO</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>Resumo</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={colors.gold} />}
      >
        {/* Summary Cards */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={[theme.card, { flex: 1, borderTopColor: colors.green, borderTopWidth: 3 }]}>
            <Text style={theme.statLabel}>Faturamento</Text>
            <Text style={[theme.statValue, { fontSize: 20, color: colors.green }]}>{formatCurrency(faturamentoMes)}</Text>
          </View>
          <View style={[theme.card, { flex: 1, borderTopColor: colors.orange, borderTopWidth: 3 }]}>
            <Text style={theme.statLabel}>A Receber</Text>
            <Text style={[theme.statValue, { fontSize: 20, color: colors.orange }]}>{formatCurrency(aReceber)}</Text>
          </View>
        </View>

        {/* Planos */}
        {data?.planos && data.planos.length > 0 && (
          <View style={theme.card}>
            <Text style={theme.sectionHeader}>Planos</Text>
            {data.planos.map((p: any) => (
              <View key={p.id} style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", paddingVertical: 8,
                borderBottomWidth: 1, borderBottomColor: colors.border,
              }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{p.nome}</Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.gold }}>
                  {formatCurrency(p.valor)}{p.taxaMatricula > 0 ? ` + ${formatCurrency(p.taxaMatricula)}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Cobranças Pendentes */}
        <View style={[theme.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Ionicons name="alert-circle" size={16} color={colors.orange} />
            <Text style={theme.sectionHeader}>
              Pendentes ({pendentes.length})
            </Text>
          </View>
          {pendentes.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: "center", padding: 12 }}>
              Nenhuma cobrança pendente
            </Text>
          ) : (
            pendentes.slice(0, 10).map((c: any) => (
              <View key={c.id} style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", paddingVertical: 8,
                borderBottomWidth: 1, borderBottomColor: colors.border,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{c.alunoNome}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    Venc: {c.vencimento ? new Date(c.vencimento).toLocaleDateString("pt-BR") : "—"}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: colors.orange }}>
                  {formatCurrency(c.valor)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
