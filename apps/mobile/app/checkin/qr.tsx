import { useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { colors, theme } from "@/lib/theme"
import { router } from "expo-router"

export default function QRCheckinScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  if (!permission) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14, textAlign: "center" }}>
          Solicitando permissão da câmera...
        </Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={[theme.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14, textAlign: "center" }}>
          Precisamos da câmera para escanear QR codes.
        </Text>
        <TouchableOpacity style={[theme.button, { marginTop: 16 }]} onPress={requestPermission}>
          <Text style={theme.buttonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return
    setScanned(true)
    Alert.alert("QR Lido", `Token: ${data.slice(0, 20)}...`, [
      { text: "OK", onPress: () => router.back() },
    ])
  }

  return (
    <View style={[theme.container, { justifyContent: "center" }]}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{
            width: 250, height: 250, borderWidth: 2, borderColor: colors.gold,
            borderRadius: 16, backgroundColor: "transparent",
          }} />

          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 24 }}>
            Escaneie o QR code da academia
          </Text>

          <TouchableOpacity
            style={{ marginTop: 32, padding: 16 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}
