import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';

const colors = {
  gray: '#929292',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSignIn = () => {
    console.log('Sign in with:', form.email, form.password);
      // cuando quede, sigue poner la logica para auteticar usuario aqui

  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <View style={styles.container}>
        <View style={{ marginTop: 1}}>
          <Image
            source={require('../../assets/images/centinela.png')}
            style={styles.headerImg}
            alt="Logo"
          />
          <Text style={styles.title}>Accede a centinela</Text>
          <Text style={styles.subtitle}>
            Inicia sesión con tu cuenta
          </Text>
        </View>
        <View style={{marginTop: 16}}>
          <Text style={styles.inputLabel}>Correo</Text>
          <TextInput
            style={[styles.input, styles.inputControl]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="arturo@example.com"
            placeholderTextColor={colors.gray}
            value={form.email}
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
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
          />     
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              handleSignIn();
            }}
          >
            <View style={styles.btn}>
              <Text style={styles.btnText}>iniciar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.formFooter}>
          No tienes cuenta?{' '}
          <Text style={{ textDecorationLine: 'underline' }}>
            Registrate
          </Text>
        </Text>
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
  container: {
    padding: 24,
    flex: 1,
  },
  headerImg: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
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
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#ccc',
  },
  formAction: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#1ba098',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'black',
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
