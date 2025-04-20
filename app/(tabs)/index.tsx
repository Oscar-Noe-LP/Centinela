import React, { useState, useRef, useEffect } from "react";
import {SafeAreaView, View, StyleSheet, Text, ActivityIndicator, Alert,} from "react-native";
import {CameraView, useCameraPermissions, CameraMode, CameraType,} from "expo-camera";
import axios from "axios";
import Animated, {useSharedValue, useAnimatedStyle, withSpring,} from "react-native-reanimated";

const Linkapi = "http://192.168.1.72:8000"; // sin https y con IP local

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [cameraZoom, setCameraZoom] = useState<number>(0);
  const [cameraMode] = useState<CameraMode>("picture");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animación
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    const interval = setInterval(() => {
      tomarYPredecir();
    }, 4000); // cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const tomarYPredecir = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });

        if (!photo || !photo.uri) return;

        setLoading(true);
        scale.value = withSpring(0.8);
        opacity.value = withSpring(0.5);

        const uriParts = photo.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append("file", {
          uri: photo.uri,
          name: `frame.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        const res = await axios.post(`${Linkapi}/detección`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data && res.data.Fatiga !== undefined) {
          setPrediction(res.data.Fatiga ? "Fatiga detectada 🥱" : "Todo bien 😎");
        }
      } catch (error) {
        console.log("Error al mandar frame:", error);
        setPrediction("Error 😬");
      } finally {
        setLoading(false);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
      }
    }
  };

  if (!permission || permission.status !== "granted") {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No tienes permiso pa la cámara</Text>
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
      />
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {loading && <ActivityIndicator size="large" color="#48c9b0" />}
        {prediction && !loading && (
          <Text style={styles.predictionText}>{prediction}</Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  animatedContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#ffffffcc",
    borderRadius: 15,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
