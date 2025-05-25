import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, ScrollView, TextInput, FlatList } from 'react-native';
 
interface Alerta {
  id: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  detalle: string;
}
 
export default function Historial() {
    //const [alertas, setAlertas] = useState<Alerta[]>([]);
 
    const alertas: Alerta[] = [
        { id: '1', fecha: '22042025', hora: 'afxad', ubicacion: 'lol', detalle: 'Bostezo'},
        { id: '2', fecha: '23042025', hora: 'afxad', ubicacion: 'lol', detalle: 'Fatiga visual'},
        { id: '3', fecha: '230425', hora: 'afxad', ubicacion: 'saa', detalle: 'Fatiga visual'},
    ];
 
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
                            <TextInput
                                style={styles.habitoInput}
                                value="Sesión: 23/04/2025 10:30 AM"
                                editable={false}
                            />
                            <TextInput
                                style={styles.habitoInput}
                                value="Duración: 45 minutos"
                                editable={false}
                            />
                            <TextInput
                                style={styles.habitoInput}
                                value="Total de alertas: 3"
                                editable={false}
                            />
                            <TextInput
                                style={styles.habitoInput}
                                value="Última sesión: 22/04/2025"
                                editable={false}
                            />
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
        borderWidth:1,
        borderColor: '#1ba098',
        flex: 1,
        padding: 8,
        textAlign: 'center',

},    
    habitosContainer: {
        backgroundColor: '#00A19D',
        borderRadius: 8,
        marginTop: '10%',
        padding: 15,
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
});
