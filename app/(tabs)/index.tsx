import React, { useState, useRef, useEffect } from "react";
import {SafeAreaView, View, Button, Image, StyleSheet, Text, ActivityIndicator, Alert} from "react-native";
import { CameraView, useCameraPermissions, CameraMode, CameraType } from "expo-camera";
import axios from "axios";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const Linkapi = "https://192.168.1.72:8000";

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraZoom, setCameraZoom] = useState<number>(0);
  const [cameraMode] = useState<CameraMode>("picture");
  const [pictureUri, setPictureUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // Nuevo estado

  // Valores compartidos para animaciones
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPictureUri(photo.uri); // Guarda la URI de la foto
          setShowCamera(false); // Oculta la cámara y muestra la foto
        }
      } catch (error) {
        console.error("Error al tomar la foto:", error);
        Alert.alert("Error", "Hubo un problema al tomar la foto.");
      }
    }
  };

  // Salir de la pantalla
  const handleExit = () => {
    Alert.alert("¡Nos vemos!", "Gracias por usar Laika 🐶.");
    setPictureUri(null);
    setPrediction(null);
    setShowCamera(true); // Limpia estados y vuelve a la cámara
  };

  // Función para predecir la imagen
  const predictImage = async () => {
    if (!pictureUri) return;

    setLoading(true);
    scale.value = withSpring(0.8);
    opacity.value = withSpring(0.5);

    const formData = new FormData();
    const uriParts = pictureUri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    formData.append("file", {
      uri: pictureUri,
      name: `image.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const response = await axios.post(`${Linkapi}/predict/image/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrediction(response.data.prediction.class);
    } catch (error) {
      console.error("Error al predecir:", error);
      Alert.alert("Error", "Hubo un problema al realizar la predicción.");
    } finally {
      setLoading(false);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const increaseZoom = () => {
    if (cameraZoom < 1) setCameraZoom((prevValue) => prevValue + 0.1);
  };

  const decreaseZoom = () => {
    if (cameraZoom > 0) setCameraZoom((prevValue) => prevValue - 0.1);
  };

  if (!permission || permission.status !== "granted") {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No permission to access the camera</Text>
        <Button title="Request Permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode={cameraMode}
        zoom={cameraZoom}
        facing={facing}
        ratio="16:9"
      >
        <View style={styles.controls}>
          <Button title="Tomar Foto" onPress={handleTakePicture} />
          <Button title="Cambiar Cámara" onPress={toggleCameraFacing} />
          <View style={styles.zoomControls}>
            <Button title="Zoom +" onPress={increaseZoom} />
            <Button title="Zoom -" onPress={decreaseZoom} />
          </View>
        </View>
      </CameraView>

      {!showCamera && pictureUri && (
        <>
          <Image source={{ uri: pictureUri }} style={styles.image} />
          <Button title="Salir" onPress={handleExit} color="#e74c3c" />
        </>
      )}

      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {loading && <ActivityIndicator size="large" color="#48c9b0" />}
        {prediction && !loading && (
          <Text style={styles.predictionText}>Tu perro se siente: {prediction}</Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  controls: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  zoomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "40%",
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#48c9b0",
  },
  animatedContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  predictionText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#f39c12",
  },
});
