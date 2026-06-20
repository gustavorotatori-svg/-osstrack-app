import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { colors, theme } from "@/lib/theme"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

export default function TreinoScreen() {
  return (
    <View style={theme.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: colors.gold, letterSpacing: 2, marginBottom: 2 }}>TREINO</Text>
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text, marginBottom: 20 }}>Registrar Treino</Text>

        <TouchableOpacity
          style={[theme.button, { flexDirection: "row", gap: 8, marginBottom: 16 }]}
          onPress={() => router.push("/checkin/qr")}
        >
          <Ionicons name="qr-code" size={20} color="#000" />
          <Text style={theme.buttonText}>Fazer Check-in</Text>
        </TouchableOpacity>

        <View style={[theme.card, { alignItems: "center", padding: 32 }]}>
          <Ionicons name="barbell-outline" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 14, textAlign: "center" }}>
            Seus treinos aparecerão aqui depois do check-in.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
