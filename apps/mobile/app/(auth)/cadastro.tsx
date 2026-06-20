import { useState } from "react"
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from "react-native"
import { api } from "@/lib/shared"
import { useAuth } from "@/lib/auth"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function CadastroScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "", email: "", senha: "",
    role: "aluno" as string,
    academiaNome: "",
  })

  async function handleCadastro() {
    if (!form.nome || !form.email || !form.senha) {
      Alert.alert("Atenção", "Preencha todos os campos")
      return
    }
    setLoading(true)
    const res = await api.register(form)
    setLoading(false)
    if (!res.ok) {
      Alert.alert("Erro", res.error || "Erro ao cadastrar")
      return
    }
    // Auto-login after register
    const error = await login(form.email, form.senha)
    if (error) Alert.alert("Atenção", "Conta criada, mas faça login manualmente")
  }

  return (
    <KeyboardAvoidingView
      style={theme.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        {/* Icon */}
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: colors.gold, justifyContent: "center",
            alignItems: "center", marginBottom: 16,
          }}>
            <Text style={{ fontSize: 28 }}>🥋</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>
            Criar Conta
          </Text>
          <Text style={{ fontSize: 13, color: colors.gold, marginTop: 4 }}>
            Comece sua jornada grátis
          </Text>
        </View>

        <View style={theme.card}>
          <Text style={[theme.label, { marginTop: 0 }]}>Nome</Text>
          <TextInput
            style={theme.input}
            value={form.nome}
            onChangeText={(v) => setForm({ ...form, nome: v })}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[theme.label, { marginTop: 14 }]}>Email</Text>
          <TextInput
            style={theme.input}
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[theme.label, { marginTop: 14 }]}>Senha</Text>
          <TextInput
            style={theme.input}
            value={form.senha}
            onChangeText={(v) => setForm({ ...form, senha: v })}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <Text style={[theme.label, { marginTop: 14 }]}>Perfil</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["aluno", "professor", "dono"].map((role) => (
              <TouchableOpacity
                key={role}
                style={{
                  flex: 1, padding: 12, borderRadius: 10,
                  backgroundColor: form.role === role ? `${colors.gold}20` : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: form.role === role ? colors.gold : colors.border,
                  alignItems: "center",
                }}
                onPress={() => setForm({ ...form, role })}
              >
                <Text style={{
                  fontSize: 12, fontWeight: "700",
                  color: form.role === role ? colors.gold : colors.textMuted,
                  textTransform: "capitalize",
                }}>
                  {role === "dono" ? "Dono" : role === "aluno" ? "Aluno" : "Professor"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(form.role === "dono" || form.role === "professor") && (
            <>
              <Text style={[theme.label, { marginTop: 14 }]}>Nome da Academia</Text>
              <TextInput
                style={theme.input}
                value={form.academiaNome}
                onChangeText={(v) => setForm({ ...form, academiaNome: v })}
                placeholder="Ex: Gracie Barra"
                placeholderTextColor={colors.textMuted}
              />
            </>
          )}

          <TouchableOpacity
            style={[theme.button, { marginTop: 20 }]}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={theme.buttonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ marginTop: 20, alignItems: "center" }}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Já tem conta?{" "}
            <Text style={{ color: colors.gold, fontWeight: "700" }}>
              Fazer login
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
