import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Alertas {
  id: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  detalle: string;
}

interface Historial {
    totalsesiones: string;
    totalalertas: string;
    ultimasesion: string;
    duracion: string;    
}


export default function Historial() {
    const [alertas, setAlertas] = useState<Alertas[]>([]);
    const [habitos, setHabitos] = useState<Historial | null>(null);
    
    useEffect(() => {
        const MostrAlertas = async () => {
            const rvp1 = await AsyncStorage.getItem('IdUsuario');
            if (rvp1) {
                try {
                    const responseAler = await axios.get(`https://centinela.onrender.com/alertasuser/${rvp1}`);
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
                try {
                    const responsehab = await axios.get(`https://centinela.onrender.com/habitosuser/${rvp1}`);
                    setHabitos(responsehab.data); 
                    console.log(responsehab.data);
                 } catch (error) {
                    console.error("Error al obtener hábitos:", error);
                }
            }
        };
        MostrAlertas();
    }, []);


    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={alertas}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                  <>
                  <Text style={styles.titulo}>Historial de alertas</Text>
                  <View style={styles.tabla}>                
                    <View style={styles.filaEncabezado}>
                        <Text style={styles.celdaEncabezado}>Fecha</Text>
                        <Text style={styles.celdaEncabezado}>Hora</Text>
                        <Text style={styles.celdaEncabezado}>Ubicación</Text>
                        <Text style={styles.celdaEncabezado}>Detalles</Text>
                    </View>
                  </View>
                  </>
                }
                renderItem={({ item }) => (
                    <View style={styles.fila}>
                        <Text style={styles.celda}>{item.fecha}</Text>
                        <Text style={styles.celda}>{item.hora}</Text>
                        <Text style={styles.celda}>{item.ubicacion}</Text>
                        <Text style={styles.celda}>{item.detalle}</Text>
                    </View>
                )}
                ListFooterComponent={
                  <>
                    <View style={styles.habitosContainer}>
                        <Text style={styles.subtitulo}>Tus hábitos de manejo</Text>
                        <View style={styles.habitos}>
                            <Text style={styles.habitoLabel}>Total de sesiones:</Text>
                            <Text style={styles.habitoInput}>{habitos?.totalsesiones || 'Cargando...'}</Text>

                            <Text style={styles.habitoLabel}>Total de alertas:</Text>
                            <Text style={styles.habitoInput}>{habitos?.totalalertas || 'Cargando...'}</Text>

                            <Text style={styles.habitoLabel}>Inicio de última sesión:</Text>
                            <Text style={styles.habitoInput}>{habitos?.ultimasesion || 'Cargando...'}</Text>
    
                            <Text style={styles.habitoLabel}>Duración de última sesión (min):</Text>
                            <Text style={styles.habitoInput}>{habitos?.duracion || 'Cargando...'}</Text>
                        </View>
                    </View>
                  </>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    titulo: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        marginTop: 20
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
        borderWidth: 1,
        borderColor: '#1ba098',
        flex: 1,
        padding: 8,
        textAlign: 'center',
    },
    habitosContainer: {
        backgroundColor: '#00A19D',
        borderRadius: 8,
        padding: 15, 
        marginTop: '10%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15, 
    },
    habitos: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15, 
        paddingBottom: 5, 
    },
    habitoInput: {
        backgroundColor: 'white',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 15, 
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#000',
    },
    habitoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 3,
    },
});