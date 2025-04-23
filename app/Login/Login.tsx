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
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://raw.githubusercontent.com/Oscar-Noe-LP/Centinela/Frontend/assets/images/centinela.JPG' }}
            style={styles.headerImg}
            alt="Logo"
          />
          <Text style={styles.title}>Accede a centinela</Text>
          <Text style={styles.subtitle}>
            Inicia sesión con tu cuenta
          </Text>
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
            value={form.email}
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
          no tienes cuenta?{' '}
          <Text style={{ textDecorationLine: 'underline' }}>
            Registrate
          </Text>
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
    flexGrow: 1,
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
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#ccc',
  },
  formAction: {
    marginVertical: 24,
  },
  btn: {
    backgroundColor: '#1ba098',
    borderRadius: 8,
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
});
