import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  gray: '#929292',
};

export default function Registro() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSignUp = () => {
    console.log('Sign up with:', form.name, form.email, form.password);
    // aqui va la logica cuando quede x2
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://raw.githubusercontent.com/Oscar-Noe-LP/Centinela/Frontend/assets/images/centinela.JPG' }}
            style={styles.headerImg}
            alt="Logo"
            resizeMode="contain"
            onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
          />
          <Text style={styles.title}>Regístrate en Centinela</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para empezar</Text>
        </View>
        <View style={styles.form}>
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
        <View style={styles.form}>
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
        <View style={styles.form}>
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
        <View style={styles.formAction}>
          <TouchableOpacity onPress={handleSignUp}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: 'black',
  },
  formAction: {
    marginVertical: 24,
  },
  btn: {
    backgroundColor: '#1ba098',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1ba098',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  formFooter: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
});