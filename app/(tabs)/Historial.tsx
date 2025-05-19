import React from 'react';
import {SafeAreaView, View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Historial() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.titulo}>Historial de alertas</Text>
                <View style={styles.tabla}>                
                    <View style={styles.filaEncabezado}>
                        <Text style={styles.celdaEncabezado}>Fecha/hora</Text>
                        <Text style={styles.celdaEncabezado}>Ubicación</Text>
                        <Text style={styles.celdaEncabezado}>Detalles de alerta</Text>
                    </View>
                    <View style={styles.fila}>
                        <Text style={styles.celda}>23/04/2025</Text>
                        <Text style={styles.celda}>lat</Text>
                        <Text style={styles.celda}>Bostezo</Text>
                    </View>
                    <View style={styles.fila}>
                        <Text style={styles.celda}>23/04/2025</Text>
                        <Text style={styles.celda}>lat</Text>
                        <Text style={styles.celda}>Fatiga visual</Text>
                    </View>
                    <View style={styles.fila}>
                        <Text style={styles.celda}>23/04/2025</Text>
                        <Text style={styles.celda}>lat</Text>
                        <Text style={styles.celda}>Fatiga visual</Text>
                    </View>
                </View>
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
            </ScrollView>
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
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filaEncabezado: {
        flexDirection: 'row',
        backgroundColor: '#00A19D',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    celdaEncabezado: {
        flex: 1,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 12,
    },
    fila: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1ba098',
        backgroundColor: 'white',
    },
    celda: {
        flex: 1,
        color: '#000',
        textAlign: 'center',
        fontSize: 12,
    },
    habitosContainer: {
        backgroundColor: '#00A19D',
        borderRadius: 8,
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