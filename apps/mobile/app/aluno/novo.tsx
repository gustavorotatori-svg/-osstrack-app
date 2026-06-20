import { useState } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function NovoAlunoScreen() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "", email: "", senha: "123456",
    faixa: "Branca", grau: 0,
  })

  const faixas = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

  async function handleSave() {
    if (!form.nome) {
      Alert.alert("Atenção", "Nome é obrigatório")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("https://osstrack-app.vercel.app/api/academia/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        Alert.alert("Sucesso", "Aluno cadastrado!", [
          { text: "OK", onPress: () => router.back() },
        ])
      } else {
        const err = await res.json()
        Alert.alert("Erro", err.error || "Erro ao cadastrar")
      }
    } catch {
      Alert.alert("Erro", "Erro de conexão")
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={theme.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2 }}>NOVO ALUNO</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>Cadastrar</Text>
          </View>
        </View>

        <View style={theme.card}>
          <Text style={[theme.label, { marginTop: 0 }]}>Nome completo *</Text>
          <TextInput style={theme.input} value={form.nome} onChangeText={(v) => setForm({ ...form, nome: v })}
            placeholder="Nome do aluno" placeholderTextColor={colors.textMuted} />

          <Text style={[theme.label, { marginTop: 14 }]}>Email</Text>
          <TextInput style={theme.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })}
            placeholder="aluno@email.com" placeholderTextColor={colors.textMuted}
            autoCapitalize="none" keyboardType="email-address" />

          <Text style={[theme.label, { marginTop: 14 }]}>Faixa</Text>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            {faixas.map((f) => (
              <TouchableOpacity key={f} style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                backgroundColor: form.faixa === f ? `${colors.gold}20` : colors.bgSurface,
                borderWidth: 1,
                borderColor: form.faixa === f ? colors.gold : colors.border,
              }} onPress={() => setForm({ ...form, faixa: f })}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: form.faixa === f ? colors.gold : colors.textMuted }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[theme.button, { marginTop: 20 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={theme.buttonText}>Cadastrar Aluno</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
