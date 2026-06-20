import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/lib/auth"
import { colors, theme } from "@/lib/theme"

export default function PerfilScreen() {
  const { user, logout } = useAuth()

  function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ])
  }

  return (
    <View style={theme.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        {/* Avatar / User Info */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: `${colors.gold}15`,
            justifyContent: "center", alignItems: "center",
            marginBottom: 12, borderWidth: 2, borderColor: colors.gold,
          }}>
            <Text style={{ fontSize: 32 }}>🥋</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.text }}>{user?.nome}</Text>
          <Text style={{ fontSize: 13, color: colors.gold, marginTop: 2, fontWeight: "600" }}>
            {user?.faixa} · {user?.role === "dono" ? "Dono" : user?.role === "professor" ? "Professor" : "Aluno"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{user?.email}</Text>
        </View>

        {/* Settings */}
        <View style={theme.card}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
            <Ionicons name="person-outline" size={18} color={colors.gold} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 }}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
            <Ionicons name="notifications-outline" size={18} color={colors.gold} />
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 }}>Notificações</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {user?.role !== "aluno" && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
                <Ionicons name="settings-outline" size={18} color={colors.gold} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 }}>Configurações</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[theme.card, { marginTop: 16, alignItems: "center", borderColor: `${colors.red}30` }]}
          onPress={handleLogout}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.red }}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
