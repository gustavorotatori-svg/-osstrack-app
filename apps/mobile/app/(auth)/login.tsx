import { useState } from "react"
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native"
import { useAuth } from "@/lib/auth"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha email e senha")
      return
    }
    setLoading(true)
    const error = await login(email, senha)
    setLoading(false)
    if (error) {
      Alert.alert("Erro", error)
    }
  }

  return (
    <KeyboardAvoidingView
      style={theme.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        {/* Logo / Icon */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: colors.gold, justifyContent: "center",
            alignItems: "center", marginBottom: 16,
          }}>
            <Text style={{ fontSize: 28 }}>🥋</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>
            OssTrack
          </Text>
          <Text style={{ fontSize: 13, color: colors.gold, marginTop: 4 }}>
            Sua jornada no Jiu-Jitsu começa aqui.
          </Text>
        </View>

        {/* Form */}
        <View style={theme.card}>
          <Text style={[theme.label, { marginTop: 0 }]}>Email</Text>
          <TextInput
            style={theme.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[theme.label, { marginTop: 16 }]}>Senha</Text>
          <TextInput
            style={theme.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Sua senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={[theme.button, { marginTop: 20 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={theme.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <TouchableOpacity
          style={{ marginTop: 20, alignItems: "center" }}
          onPress={() => router.push("/cadastro")}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Não tem conta?{" "}
            <Text style={{ color: colors.gold, fontWeight: "700" }}>
              Criar conta
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
