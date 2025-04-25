import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';

export default function Configuracion() {
  const [showVisualAlerts, setShowVisualAlerts] = useState(true);
  const [selectedTone, setSelectedTone] = useState('Lluvia');
  const [selectedTheme, setSelectedTheme] = useState('Claro');

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Configuración</Text>

      {/* Campos de entrada con etiquetas */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nombre:</Text>
        <TextInput style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Correo:</Text>
        <TextInput style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tipo de usuario:</Text>
        <TextInput style={styles.input} />
      </View>

      {/* Toggle para alertas visuales */}
      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Mostrar alertas visuales</Text>
        <View style={styles.toggleOptions}>
          <Text style={styles.toggleText}>{showVisualAlerts ? 'Sí' : 'No'}</Text>
          <Switch
            value={showVisualAlerts}
            onValueChange={setShowVisualAlerts}
            trackColor={{ false: '#E0E0E0', true: '#00A19D' }}
            thumbColor={showVisualAlerts ? '#FFF' : '#FFF'}
          />
        </View>
      </View>

      {/* Tono preferido */}
      <View style={styles.toneContainer}>
        <Text style={styles.label}>Tono preferido</Text>
        <View style={styles.toneOptions}>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Lluvia' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Lluvia')}
          >
            <Text style={styles.toneText}>LLUVIA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Música' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Música')}
          >
            <Text style={styles.toneText}>MÚSICA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Pájaros' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Pájaros')}
          >
            <Text style={styles.toneText}>PÁJAROS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Personalizado' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Personalizado')}
          >
            <Text style={styles.toneText}>PERSONALIZADO</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selector de tema */}
      <View style={styles.themeContainer}>
        <Text style={styles.label}>Tema:</Text>
        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[styles.themeButton, selectedTheme === 'Claro' && styles.themeButtonSelectedClaro]}
            onPress={() => setSelectedTheme('Claro')}
          >
            <Text style={styles.themeText}>Claro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, selectedTheme === 'Oscuro' && styles.themeButtonSelectedOscuro]}
            onPress={() => setSelectedTheme('Oscuro')}
          >
            <Text style={styles.themeText}>Oscuro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contactos de emergencia */}
      <View style={styles.emergencyContainer}>
        <Text style={styles.label}>Contactos de emergencia</Text>
        <View style={styles.contact}>
          <Text style={styles.contactText}>René Lara</Text>
          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Añadir contacto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A19D',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    width: 120, // Ancho fijo para alinear las etiquetas
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  toneContainer: {
    marginBottom: 20,
  },
  toneOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00A19D',
    borderRadius: 6,
    padding: 10,
  },
  toneButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  toneButtonSelected: {
    backgroundColor: '#E0E0E0',
  },
  toneText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  themeContainer: {
    marginBottom: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  themeButtonSelectedClaro: {
    backgroundColor: '#FFF',
  },
  themeButtonSelectedOscuro: {
    backgroundColor: '#000',
  },
  themeText: {
    fontSize: 14,
    color: '#333',
  },
  emergencyContainer: {
    marginBottom: 20,
  },
  contact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#00A19D',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});



