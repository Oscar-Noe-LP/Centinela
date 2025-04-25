import { CameraView, CameraType, useCameraPermissions, CameraMode } from 'expo-camera';
import { useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import {useIsFocused} from '@react-navigation/native';

export default function Calibración() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [cameraZoom] = useState<number>(0);
  const [cameraMode] = useState<CameraMode>("picture");
  const estaEnfocada = useIsFocused();
  const [MostrarCamara, setMostrarCamara] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(true);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);
  
  useEffect(() => {
    if (estaEnfocada) {
      setMostrarCamara(true);
      setMostrarModal(true);
    }
    else {
      setMostrarCamara(false);
    }
  }, [estaEnfocada]);

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
        <CameraView 
        style={estilos.camera}           
        mode={cameraMode}
        zoom={cameraZoom}
        facing={facing}
        ratio="16:9"
        animateShutter={false}>
          <View style={estilos.Guia} />
        </CameraView>
      )}
      <Modal
        visible={mostrarModal}
        animationType="slide"
        transparent
      >
        <View style={estilos.modal}>
          <View style={estilos.Contenidomodal}>
            <Text style={estilos.Titulomodal}>Instrucciones:</Text>
            <Text style={estilos.Textomodal}>
              1.- Coloca el celular en una posición en la que detecte tu rostro correctamente, de preferencia dentro del rectángulo de guía.{"\n\n"}
              2.- Viaja a la pantalla de "Detección" (navega mediante la barra inferior) y comienza a usar tu "Guardián en el camino!"
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
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
