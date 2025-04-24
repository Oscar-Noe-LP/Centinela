import React, { useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://raw.githubusercontent.com/Oscar-Noe-LP/Centinela/Frontend/assets/images/centinela.JPG' }}
        style={styles.headerImg}
        alt="Logo"
        resizeMode="contain"
      />
      <Text style={styles.title}>Tu guardián al volante</Text>
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
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  headerImg: {
    width: 80,
    height: 80,
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
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});