import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ScrollView} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const colors = {
  gray: '#929292',
};

export default function Registro() {
  const [form, setForm] = useState({ name: '', email: '', password: '', tipouser: '', telefono: '' });
  const router = useRouter();

  const Registrar = async () => {
    try {
    const response = await axios.post('https://centinela.onrender.com/registro', {
      nombre: form.name,
      buzon: form.email,
      wlst: form.password,
      tipo_usuario: form.tipouser,
      telefono: form.telefono
    });
    console.log('Registro exitoso:', response.data);
    router.push('/(tabs)/Principal'); 
    } catch (error) {
    console.error('Error al registrarse:', error);
    Alert.alert('Error', 'No se pudo registrar el usuario');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <ScrollView>
        <View style={styles.container}>
          <View style={{ marginTop:1}}>
            <Image
              source={require('../../assets/images/centinela.png')}
              style={styles.headerImg}
              alt="Logo"
            />
            <Text style={styles.title}>Regístrate en Centinela</Text>
            <Text style={styles.subtitle}>Crea tu cuenta para empezar</Text>
          </View>
          <View style={{marginTop: 16}}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={[styles.input, styles.inputControl]}
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="usuario"
              placeholderTextColor={colors.gray}
              value={form.name || ''}
              onChangeText={(name) => setForm({ ...form, name })}
            />
          </View>
          <View style={{marginTop: 1}}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={[styles.input, styles.inputControl]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="arturo@example.com"
              placeholderTextColor={colors.gray}
              value={form.email || ''}
              onChangeText={(email) => setForm({ ...form, email })}
            />
          </View>
          <View style={{marginTop: 1}}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={[styles.input, styles.inputControl]}
              autoCapitalize="none"
              secureTextEntry
              placeholder="********"
              placeholderTextColor={colors.gray}
              value={form.password || ''}
              onChangeText={(password) => setForm({ ...form, password })}
            />
          </View>
          <View style={{marginTop: 1}}>
            <Text style={styles.inputLabel}>Tipo de usuario</Text>
            <TextInput
              style={[styles.input, styles.inputControl]}
              autoCapitalize="none"
              secureTextEntry
              placeholder="Padre, Hijo o Conductor"
              placeholderTextColor={colors.gray}
              value={form.tipouser || ''}
              onChangeText={(tipouser) => setForm({ ...form, tipouser })}
            />
          </View>
          <View style={{marginTop: 1}}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={[styles.input, styles.inputControl]}
              autoCapitalize="none"
              secureTextEntry
              placeholder="Número de teléfono"
              placeholderTextColor={colors.gray}
              value={form.telefono || ''}
              onChangeText={(telefono) => setForm({ ...form, telefono })}
            />
          </View>
          <View style={styles.formAction}>
            <TouchableOpacity onPress={Registrar}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Registrarse</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.formFooter}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ textDecorationLine: 'underline' }}>Inicia sesión</Text>
          </Text>
        </View>
        <View style={styles.contenedor_pie}>
            <Text style={styles.piepagina}>
              ©Centinela 2025. TODOS LOS DERECHOS RESERVADOS.
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 30,
    flex: 1,
    gap: 8,
  },
  headerImg: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
    marginBottom: 6,
  },
  input: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  inputControl: {
    height: 38,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    borderWidth: 1,
    borderColor: 'black',
  },
  formAction: {
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#1ba098',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1ba098',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#fff',
  },
  formFooter: {
    fontSize: 13,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    marginTop: 6,
  },
  contenedor_pie: {
    alignItems: "center",
    marginBottom: 5,
  },
  piepagina: {
    fontSize: 14,
    color: "#293855",
    textAlign: "center",
  },
});
