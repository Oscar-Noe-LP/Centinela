import React, { useState, useRef, useEffect } from "react";
import {SafeAreaView, View, StyleSheet, Text, ActivityIndicator, TouchableOpacity} from "react-native";
import {CameraView, useCameraPermissions, CameraMode, CameraType,} from "expo-camera";
import * as ImageManipulator from 'expo-image-manipulator';
import Animated, {useSharedValue, useAnimatedStyle, withSpring,} from "react-native-reanimated";
import {useIsFocused} from '@react-navigation/native';
import axios from "axios";
import * as Location from "expo-location";
import { Audio } from 'expo-av';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Brightness from 'expo-brightness';


const Linkapi = "wss://centinela.onrender.com/ws/deteccion"; 
const promediousuario = AsyncStorage.getItem('Promedio');

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
  const [contadorBostezo, setContadorBostezo] = useState(0);
  const [contadorFatiga, setContadorFatiga] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [sound, setSound] = useState<Audio.Sound>();
  const brilloAnterior = useRef(1);
  const [modoAhorro, setModoAhorro] = useState(false);
  const [SesionActual, setSesionActual] = useState<number | null>(null);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const COOLDOWN = 10000;
  const ahora = () => new Date().getTime();
  const ultimosAlertas = useRef({ Bostezo: 0, Fatiga: 0 });

  
  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        Brightness.setSystemBrightnessAsync(1);
      }
    })();
  }, []);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    if (estaEnfocada) {
      setMostrarCamara(true);
      crearSesion();
      conectarWebSocket();
      const interval = setInterval(() => {
        tomarYPredecir();
      }, 500); 
  
      return () => {
        clearInterval(interval);
        cerrarSesion();
        desconectarWebSocket();
      };
    }
    else {
      setMostrarCamara(false);
      setPrediction(null);
      desconectarWebSocket();
    }
  }, [estaEnfocada]);


  const crearSesion = async () => {
    try {
      const rvp1 = await AsyncStorage.getItem("IdUsuario");
      const respuesta = await axios.post("https://centinela.onrender.com/sesiones", {
        rvp1: rvp1,
        fecha_inicio: new Date().toISOString().split("T")[0],
        hora_inicio: new Date().toLocaleTimeString('es-MX')
      });
      console.log("Sesión creada:", respuesta.data.rvp2);
      setSesionActual(respuesta.data.rvp2);
    } catch (error) {
      console.error("Error al crear sesión:", error);
    }
  };

  const cerrarSesion = async () => {
    try {
      const respuesta = await axios.post("https://centinela.onrender.com/sesion", {
        rvp2: SesionActual,
        fecha_fin: new Date().toISOString().split("T")[0],
        hora_fin: new Date().toLocaleTimeString('es-MX')
      });
      console.log("Sesión cerrada", respuesta.data);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const obtenerUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permiso de ubicación denegado");
        return null;
      }
      const Ubicacion = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = Ubicacion.coords;
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      return null;
    }
  };

  const guardarAlerta = async (tipo: string) => {
  if (SesionActual === null) {
    console.log("No se puede guardar alerta: sesión aún no inicializada");
    return;
  }
  try {
    const Ubicacion = await obtenerUbicacion();
    const respuesta = await axios.post("https://centinela.onrender.com/alertas", {
      rvp2: SesionActual,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString('es-MX'),
      ubicacion: Ubicacion,
      tipo: tipo,
    });
    console.log("Alerta guardada:", respuesta.data);
    } catch (error) {
      console.error("Error al guardar alerta:", error);
    }
  };

  const SonarAlerta = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/audios/alerta.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  const conectarWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket ya está abierto");
      return;
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
        setContadorBostezo((prev) => {
          const nuevo = Bostezo ? prev + 1 : 0;
          if (nuevo === 3 && ahora() - ultimosAlertas.current.Bostezo > COOLDOWN) {
            guardarAlerta("Bostezo");
            ultimosAlertas.current.Bostezo = ahora();
          }
          return nuevo;
        });

        setContadorFatiga((prev) => {
          const nuevo = Fatiga ? prev + 1 : 0;


        if (nuevo === 3 && ahora() - ultimosAlertas.current.Fatiga > COOLDOWN) {
          SonarAlerta();
          guardarAlerta("Fatiga");
          ultimosAlertas.current.Fatiga = ahora();
        }

          return nuevo;
        });

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

  const activarModoAhorro = async () => {
    try {
      const brilloActual = await Brightness.getSystemBrightnessAsync();
      brilloAnterior.current = brilloActual; 
      await Brightness.setSystemBrightnessAsync(0.01); 
      setModoAhorro(true);
    } catch (error) {
      console.error("Error activando modo ahorro:", error);
    }
  };

  const desactivarModoAhorro = async () => {
    try {
      await Brightness.setSystemBrightnessAsync(brilloAnterior.current); 
      setModoAhorro(false);
    } catch (error) {
      console.error("Error desactivando modo ahorro:", error);
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
      {modoAhorro && (
        <View style={styles.pantallaNegra} />
      )}
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {loading && <ActivityIndicator size="large" color="#48c9b0" />}
        {prediction && !loading && (
          <View style={styles.predictionTextContainer}>
            {/* <Text style={styles.predictionText}>EAR: {prediction.EAR}</Text> */}
            {/* <Text style={styles.predictionText}>MAR: {prediction.MAR}</Text> */}
            <Text style={styles.predictionText}>Bostezo: {prediction.Bostezo}</Text>
            <Text style={styles.predictionText}>Fatiga: {prediction.Fatiga}</Text>
          </View>
        )}
      </Animated.View>
      <View style={styles.controles}>
        <TouchableOpacity style={[styles.boton, { backgroundColor: modoAhorro ? "#95a5a6" : "#2ecc71" }]} onPress={() => activarModoAhorro()}>
          <Text style={styles.textoBoton}>Activar ahorro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, { backgroundColor: "#e74c3c" }]} onPress={() => desactivarModoAhorro()}>
          <Text style={styles.textoBoton}>Desactivar ahorro</Text>
        </TouchableOpacity>
      </View>
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
    bottom: 60,
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
  pantallaNegra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 10,
  },
  boton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
  controles: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  flexDirection: 'row',      
  justifyContent: 'space-evenly',
  alignItems: 'center',
  zIndex: 99,
  paddingHorizontal: 20,
  },
});
