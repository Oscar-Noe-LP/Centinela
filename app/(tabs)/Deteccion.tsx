import React, { useState, useRef, useEffect } from "react";
import {SafeAreaView, View, StyleSheet, Text, ActivityIndicator} from "react-native";
import {CameraView, useCameraPermissions, CameraMode, CameraType,} from "expo-camera";
import * as ImageManipulator from 'expo-image-manipulator';
import Animated, {useSharedValue, useAnimatedStyle, withSpring,} from "react-native-reanimated";
import {useIsFocused} from '@react-navigation/native';


const Linkapi = "ws://192.168.1.72:8000/ws/deteccion"; 

export default function Deteccion() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>("front");
  const [cameraZoom] = useState<number>(0);
  const [cameraMode] = useState<CameraMode>("picture");
  const [prediction, setPrediction] = useState<any | null>(null); 
  const [loading, setLoading] = useState(false);
  const estaEnfocada = useIsFocused();
  const [MostrarCamara, setMostrarCamara] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

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
    if (estaEnfocada) {
      setMostrarCamara(true);
      conectarWebSocket();
      const interval = setInterval(() => {
        tomarYPredecir();
      }, 500); 
  
      return () => 
        clearInterval(interval);
        desconectarWebSocket();
    }
    else {
      setMostrarCamara(false);
      setPrediction(null);
      desconectarWebSocket();
    }
  }, [estaEnfocada]);


  const conectarWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket ya está abierto");
      return; // Ya está conectado, no hacer nada más
    }

    socketRef.current = new WebSocket(Linkapi);

    socketRef.current.onopen = () => {
      console.log("WebSocket conectado");
    };

    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.error) {
        console.log("Error del servidor:", data.error);
      } else {
        const { EAR, MAR, Bostezo, Fatiga } = data;
        setPrediction({
          EAR: EAR?.toFixed(2),
          MAR: MAR?.toFixed(2),
          Bostezo: Bostezo ? "Sí" : "No",
          Fatiga: Fatiga ? "Sí" : "No",
        });
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket cerrado");
    };
  };

  const desconectarWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const tomarYPredecir = async () => {
    if (cameraRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, shutterSound: false, skipProcessing: true});


        if (photo && photo.uri) {
            const manipulada = await ImageManipulator.manipulateAsync(
              photo.uri,
              [{ resize: { width: 300 } }], // Puedes ajustar el tamaño aquí
              { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
    
            if (manipulada.base64) {
              socketRef.current.send(JSON.stringify({
                imagen: manipulada.base64,
              }));
    
              setLoading(true);
              scale.value = withSpring(0.8);
              opacity.value = withSpring(0.5);
            }
          }
        } catch (error) {
          console.log("Error capturando frame:", error);
        } finally {
          scale.value = withSpring(1);
          opacity.value = withSpring(1);
          setLoading(false);
        }
      }
    };

    if (!permission || permission.status !== "granted") {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No tienes permiso para la cámara</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        {MostrarCamara && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          mode={cameraMode}
          zoom={cameraZoom}
          facing={facing}
          ratio="16:9"
          animateShutter={false}
        />
      )}
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {loading && <ActivityIndicator size="large" color="#48c9b0" />}
        {prediction && !loading && (
          <View style={styles.predictionTextContainer}>
            <Text style={styles.predictionText}>EAR: {prediction.EAR}</Text>
            <Text style={styles.predictionText}>MAR: {prediction.MAR}</Text>
            <Text style={styles.predictionText}>Bostezo: {prediction.Bostezo}</Text>
            <Text style={styles.predictionText}>Fatiga: {prediction.Fatiga}</Text>
          </View>
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
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
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
  predictionTextContainer: {
    alignItems: "center",
  },
  predictionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
