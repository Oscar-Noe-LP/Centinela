<<<<<<< HEAD
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image, SafeAreaView} from 'react-native';
=======
import React, { useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
>>>>>>> 199b211ca2362ee6bc57ee6d4c0cbd6523a504a6
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Centinela</Text>
      <Image
        source={{ uri: 'https://raw.githubusercontent.com/Oscar-Noe-LP/Centinela/Frontend/assets/images/centinela.JPG' }}
        style={styles.headerImg}
        alt="Logo"
        resizeMode="contain"
      />
      <Text style={styles.title}>Tu guardián al volante</Text>
      <View style={{ marginTop: 70}}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/Login/Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/Login/Registro')}>
          <Text style={styles.buttonText}>Registro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/Principal')}>
          <Text style={styles.buttonText}>Ir a la detección</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contenedor_pie}>
          <Text style={styles.piepagina}>
            ©Centinela 2025. TODOS LOS DERECHOS RESERVADOS.
          </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerImg: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#1ba098',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
<<<<<<< HEAD
  header: {
    fontSize: 50,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1ba098',
  },
  contenedor_pie: {
    marginTop: 140,
    alignItems: "center",
  },
  piepagina: {
    fontSize: 14,
    color: "#293855",
    textAlign: "center",
  },

});
=======
});
>>>>>>> 199b211ca2362ee6bc57ee6d4c0cbd6523a504a6
