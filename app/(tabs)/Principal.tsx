import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Bienvenido a Centinela, comencemos con la detección</Text>
      <Image
        source={{ uri: 'https://raw.githubusercontent.com/Oscar-Noe-LP/Centinela/Frontend/assets/images/centinela.JPG' }}
        style={styles.headerImg}
        alt="Logo"
        resizeMode="contain"
      />
      <Text>Navega entre las pantallas a través de la barra inferior</Text>
      <TouchableOpacity 
        style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}> Regresar a Home </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#525FE1',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 20,
  }
});
