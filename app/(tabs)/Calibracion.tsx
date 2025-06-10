import { CameraView, CameraType, useCameraPermissions, CameraMode } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Modal, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Calibración() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [cameraZoom] = useState<number>(0);
  const [cameraMode] = useState<CameraMode>("picture");
  const estaEnfocada = useIsFocused();
  const [MostrarCamara, setMostrarCamara] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(true);
  const [EAR, setEAR] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    if (estaEnfocada) {
      setMostrarCamara(true);
      setMostrarModal(true);
    } else {
      setMostrarCamara(false);
    }
  }, [estaEnfocada]);

  const tomarFotoYMandar = async () => {
    if (cameraRef.current) {
      try {
        setCargando(true);
        const foto = await cameraRef.current.takePictureAsync({          
          quality: 0.8,
          skipProcessing: true,
          shutterSound: false
        });
        if (foto) {
          const formData = new FormData();
          const uriParts = foto.uri.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formData.append("file", {
            uri: foto.uri,
            name: `image.${fileType}`,
            type: `image/${fileType}`,
          } as any);
          const res = await axios.post('https://centinela.onrender.com/promedio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          await AsyncStorage.removeItem('Promedio');
          setEAR(null);
          let EAR = res.data.EAR;
          await AsyncStorage.setItem('Promedio', EAR.toString());
          setTimeout(() => setEAR(EAR), 10);
          console.log(EAR);
        }
      } catch (error) {
        console.error('Error al tomar o enviar la foto:', error);
        setEAR(null);
      } finally {
        setCargando(false);
      }
    }
  };

  if (!permission || permission.status !== "granted") {
    return (
      <SafeAreaView style={estilos.container}>
        <Text>No tienes permiso para la cámara</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.tituloPrincipal}>Módulo de Calibración</Text>

      {MostrarCamara && (
        <>
          <CameraView
            ref={cameraRef}
            style={estilos.camera}
            mode={cameraMode}
            zoom={cameraZoom}
            facing={facing}
            ratio="16:9"
          >
            <View style={estilos.Guia} />
          </CameraView>

          <TouchableOpacity
            style={estilos.botonCaptura}
            onPress={tomarFotoYMandar}
            disabled={cargando}
          >
            <Text style={estilos.textoBoton}>{cargando ? 'Procesando...' : 'Tomar Foto'}</Text>
          </TouchableOpacity>

          {EAR !== null && (
            <Text style={estilos.textoEAR}>Promedio detectado: {EAR.toFixed(2)}</Text>
          )}
        </>
      )}

      <Modal visible={mostrarModal} animationType="slide" transparent>
        <View style={estilos.modal}>
          <View style={estilos.Contenidomodal}>
            <Text style={estilos.Titulomodal}>Instrucciones:</Text>
            <Text style={estilos.Textomodal}>
              1.- Manten tu rostro en posición neutral dentro del rectángulo verde y toma una foto para detectar tu rostro correctamente.{"\n\n"}
              2.- Después de ello, coloca el teléfono en una posición en la pueda ver tu rostro para una detección precisa.{"\n\n"}
              3.- Viaja a la pantalla de "Detección" (navega mediante la barra inferior) y comienza a usar tu "Guardián en el camino!"{"\n\n"}
              4.- Si lo deseas, puedes volver a tomar la foto para volver a identificar correctamente la forma de tu rostro.
            </Text>
            <TouchableOpacity
              style={estilos.botonAceptar}
              onPress={() => setMostrarModal(false)}
            >
              <Text style={estilos.textoBoton}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 30,
    marginLeft: 15,
  },
  camera: {
    flex: 1,
  },
  Guia: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '40%',
    borderWidth: 3,
    borderColor: 'lime',
    borderRadius: 12,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Contenidomodal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
  },
  Titulomodal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  Textomodal: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    textAlign: 'justify',
  },
  botonAceptar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCaptura: {
    backgroundColor: '#1ba098',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoEAR: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: 'black',
  },
});