import React, { useState } from 'react';
import {SafeAreaView, View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, Image, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Alerta {
  id: string;
  fechaHora: string;
  ubicacion: string;
  detalle: string;
  usuario: string;
}

interface Hijo {
  id: string;
  nombre: string;
  telefono: string;
}

export default function ModuloPadres() {
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreNuevoHijo, setNombreNuevoHijo] = useState('');
  const [telefonoNuevoHijo, setTelefonoNuevoHijo] = useState('');
  const [listaHijos, setListaHijos] = useState<Hijo[]>([
    { id: '0', nombre: 'ejemplo', telefono: '0000000000' },
  ]);

  const listaAlertas: Alerta[] = [
    { id: '1', fechaHora: '22042025', ubicacion: 'lol', detalle: 'Bostezo', usuario: 'Arturo Barajas' },
    { id: '2', fechaHora: '23042025', ubicacion: 'lol', detalle: 'Fatiga visual', usuario: 'Oscar López' },
    { id: '3', fechaHora: '230425', ubicacion: 'saa', detalle: 'Fatiga visual', usuario: 'Jesús Coronado' },
  ];

  const agregarHijo = async () => {
    if (nombreNuevoHijo.trim() !== '' && telefonoNuevoHijo.trim() !== '') {
      const rvp1 = await AsyncStorage.getItem('IdUsuario');
      if (rvp1) {
        try {
          const response = await axios.post('https://centinela.onrender.com/modo_padres', {
            rvp1: rvp1,
            rvp1_h: Math.floor(Math.random() * 1000),
            Nombre_hijo: nombreNuevoHijo,
            Telefono_hijo: telefonoNuevoHijo,
          });
          const nuevoHijo = {
            id: response.data.rvp1_h,
            nombre: nombreNuevoHijo,
            telefono: telefonoNuevoHijo
          };
          console.log('Hijo registrado:', response.data);
          setListaHijos(prev => [...prev, nuevoHijo]);
        } catch (error) {
          console.error('Error al registrar hijos:', error);
          Alert.alert('Error', 'Datos del hijo no guardados');
        }
      }
      setNombreNuevoHijo('');
      setTelefonoNuevoHijo('');
      setModalVisible(false);
    }
  };

  const verHistorial = (hijo: Hijo) => {
    console.log('Ver historial de', hijo.nombre);
  };
    
  const eliminarHijo = (id: string) => {
    setListaHijos(listaHijos.filter((h) => h.id !== id));
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <FlatList
        data={listaAlertas}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
          <Text style={estilos.tituloPrincipal}>Módulo para padres</Text>

          <Text style={estilos.tituloSecundario}>Alertas recibidas</Text>

          <View style={estilos.tabla}>
            <View style={estilos.filaEncabezado}>
              <Text style={estilos.celdaEncabezado}>Fecha y hora</Text>
              <Text style={estilos.celdaEncabezado}>Ubicación</Text>
              <Text style={estilos.celdaEncabezado}>Detalles</Text>
              <Text style={estilos.celdaEncabezado}>Usuario</Text>
            </View>
          </View>
          </>
        }
        renderItem={({ item }) => (
            <View style={estilos.fila}>
              <Text style={estilos.celda}>{item.fechaHora}</Text>
              <Text style={estilos.celda}>{item.ubicacion}</Text>
              <Text style={estilos.celda}>{item.detalle}</Text>
              <Text style={estilos.celda}>{item.usuario}</Text>
            </View>
        )}
        ListFooterComponent={
          <> 
          <Text style={estilos.tituloSecundario}>Hijos asociados</Text>
          {listaHijos.map((hijo) => (
          <View key={hijo.id} style={estilos.hijoContenedor}>
            <View style={estilos.hijoFila}>
              <Text style={estilos.hijoNombre}>{hijo.nombre}</Text>
              <View style={estilos.botonesHijo}>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => verHistorial(hijo)}>
                  <Text style={estilos.textoBoton}>Ver Historial</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.botonAccion} onPress={() => eliminarHijo(hijo.id)}>
                  <Text style={estilos.textoBoton}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={estilos.telefonoHijo}>{hijo.telefono}</Text>
          </View>
        ))}

          <TouchableOpacity
            style={estilos.botonAsociar}
            onPress={() => setModalVisible(true)}
          >
            <Text style={estilos.textoBoton}>Asociar hijo</Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/mapa.png")} 
            style={estilos.mapa}
          />
          </>
        }
      />
      {/* Modal para agregar hijo */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={estilos.modalFondo}>
          <View style={estilos.modalContenido}>
            <Text style={estilos.tituloModal}>Agregar nuevo hijo</Text>
            <TextInput
              style={estilos.inputTexto}
              placeholder="Nombre del hijo"
              value={nombreNuevoHijo}
              onChangeText={setNombreNuevoHijo}
            />
            <TextInput
              style={estilos.inputTexto}
              placeholder="Teléfono del hijo"
              value={telefonoNuevoHijo}
              onChangeText={setTelefonoNuevoHijo}
              keyboardType="phone-pad"
            />
            <View style={estilos.contenedorBotonesModal}>
              <TouchableOpacity style={estilos.botonModal} onPress={agregarHijo}>
                <Text style={estilos.textoBoton}>Aceptar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={estilos.botonModal} onPress={() => setModalVisible(false)}>
                <Text style={estilos.textoBoton}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  tituloPrincipal: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
  tituloSecundario: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  tabla: {
    borderWidth: 1,
    borderColor: '#1ba098',
  },
  filaEncabezado: {
    flexDirection: 'row',
    backgroundColor: '#1ba098',
  },
  fila: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#1ba098',
  },
  celdaEncabezado: {
    flex: 1,
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  celda: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
  },
  hijoContenedor: {
    marginBottom: 10,
  },
  botonAccion: {
    backgroundColor: '#1ba098',
    height: '100%',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  botonAsociar: {
    backgroundColor: '#1ba098',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapa: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  modalFondo: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContenido: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    height: '40%',
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
  hijoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoHijo: {
    flexDirection: 'column',
    flex: 1,
  },
  botonesHijo: {
    flexDirection: 'row',
    gap: 6,
    width: '75%',
  },
  hijoNombre: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  telefonoHijo: {
    fontSize: 12,
    color: 'gray',
  },
  contenedorBotonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10, 
  },
  
  botonModal: {
    flex: 1, 
    paddingVertical: 10,
    backgroundColor: '#1ba098',
    borderRadius: 8,
    alignItems: 'center',
  },
});
