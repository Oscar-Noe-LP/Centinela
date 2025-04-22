import React from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';

export default function Login({ navigation }: { navigation: any }) {
  return (
    <View style={styles.padre}>
      <View style={styles.tarjeta}>
        <View style={styles.cajaTexto}>
          <TextInput placeholder="correo" style={{ paddingHorizontal: 15 }} />
        </View>
        <View style={styles.cajaTexto}>
          <TextInput placeholder="contraseña" style={{ paddingHorizontal: 15 }} secureTextEntry />
        </View>
        <View style={styles.PadreBoton}>
          <TouchableOpacity
            style={styles.cajaBoton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.TextoBoton}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  tarjeta: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cajaTexto: {
    paddingVertical: 20,
    backgroundColor: '#cccccc40',
    borderRadius: 30,
    marginVertical: 10,
  },
  PadreBoton: {
    alignItems: 'center',
  },
  cajaBoton: {
    backgroundColor: '#525FE1',
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
  },
  TextoBoton: {
    textAlign: 'center',
    color: 'white',
  },
});