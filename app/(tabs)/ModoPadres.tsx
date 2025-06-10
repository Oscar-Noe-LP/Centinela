import React, { useState, useEffect } from 'react';
import {SafeAreaView, View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, Image, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Alertas {
  id: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  detalle: string;
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
  const [listaHijos, setListaHijos] = useState<Hijo[]>([]);
  const [alertas, setAlertas] = useState<Alertas[]>([]);

  useEffect(() => {
      const MostrarHijos = async () => {
          const rvp1 = await AsyncStorage.getItem('IdUsuario');
          if (rvp1) {
              try {
                  const reshijos = await axios.get(`https://centinela.onrender.com/modopadres/${rvp1}`);
                  const hijos = reshijos.data.map((hijo: any) => ({
                      id: hijo.rvph,
                      nombre: hijo.Nombre_hijo,
                      telefono: hijo.Tel_hijo
                  }));
                  setListaHijos(hijos);
              } catch (error) {
                  console.error("Error al obtener los hijos asociados:", error);
              }
          }
      };
      MostrarHijos();
  }, []);

  
  const agregarHijo = async () => {
    if (nombreNuevoHijo.trim() !== '' && telefonoNuevoHijo.trim() !== '') {
      const rvp1 = await AsyncStorage.getItem('IdUsuario');
      if (rvp1) {
        try {
          const response = await axios.post('https://centinela.onrender.com/modo_padres', {
            rvp1: rvp1,
            Nombre_hijo: nombreNuevoHijo,
            Telefono_hijo: telefonoNuevoHijo,
          });
          const nuevoHijo = {
            id: response.data.rvp1_h,
            nombre: response.data.nombrehijo,
            telefono: response.data.telhijo
          };
          console.log('Hijo registrado:', response.data);
          Alert.alert('Éxito', 'Hijo asociado correctamente');
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

  const verHistorial = async (id: string) => {
    try {
      const responseAler = await axios.get(`https://centinela.onrender.com/alertasuser/${id}`);
      const Alertaslist = responseAler.data.map((alerta: any) => ({
        id: String(alerta.id_alerta),
        fecha: alerta.Fecha,
        hora: alerta.Hora,
        ubicacion: alerta.Ubicacion,
        detalle: alerta.tipo
      }));
      setAlertas(Alertaslist);
    } catch (error) {
      console.error("Error al obtener las alertas:", error);
    }
  };
  
  const eliminarHijo = async (id: string) => {
    const rvp1 = await AsyncStorage.getItem('IdUsuario');
    try {
      const response = await axios.post('https://centinela.onrender.com/borrarhijo', {
        rvp1: rvp1,
        rvp1_h: id
      });
      console.log("Hijo eliminado:", response.data);
      setListaHijos(listaHijos.filter((hijo) => hijo.id !== id));
    } catch (error) {
      console.log('Error al eliminar al hijo:', error);
    }
  };


  return (
    <SafeAreaView style={estilos.contenedor}>
      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
          <Text style={estilos.tituloPrincipal}>Módulo para padres</Text>

          <Text style={estilos.tituloSecundario}>Alertas recibidas</Text>

          <View style={estilos.tabla}>
            <View style={estilos.filaEncabezado}>
              <Text style={estilos.celdaEncabezado}>Fecha</Text>
              <Text style={estilos.celdaEncabezado}>Hora</Text>
              <Text style={estilos.celdaEncabezado}>Ubicación</Text>
              <Text style={estilos.celdaEncabezado}>Detalles</Text>
            </View>
          </View>
          </>
        }
        renderItem={({ item }) => (
            <View style={estilos.fila}>
              <Text style={estilos.celda}>{item.fecha}</Text>
              <Text style={estilos.celda}>{item.hora}</Text>
              <Text style={estilos.celda}>{item.ubicacion}</Text>
              <Text style={estilos.celda}>{item.detalle}</Text>
            </View>
        )}
        ListFooterComponent={
          <>
            <Text style={estilos.tituloSecundario}>Hijos asociados</Text>            
            <FlatList
              data={listaHijos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={estilos.hijoContenedor}>
                  <View style={estilos.hijoFila}>
                    <Text style={estilos.hijoNombre}>{item.nombre}</Text>
                    <View style={estilos.botonesHijo}>
                      <TouchableOpacity style={estilos.botonAccion} onPress={() => verHistorial(item.id)}>
                        <Text style={estilos.textoBoton}>Ver Historial</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={estilos.botonAccion} onPress={() => eliminarHijo(item.id)}>
                        <Text style={estilos.textoBoton}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={estilos.telefonoHijo}>{item.telefono}</Text>
                </View>
              )}
              scrollEnabled={false}
            />

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
    borderWidth: 1,
    flex: 1,
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  celda: {
    borderWidth: 1,
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
