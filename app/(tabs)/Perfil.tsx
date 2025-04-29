import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Modal, Image, ScrollView } from 'react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function Configuracion() {
  const [showVisualAlerts, setShowVisualAlerts] = useState(true);
  const [selectedTone, setSelectedTone] = useState('Lluvia');
  const [selectedTheme, setSelectedTheme] = useState('Claro');
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'René Lara', phone: '' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleAddContact = () => {
    if (newContactName.trim()) {
      const newContact = {
        id: Date.now().toString(),
        name: newContactName,
        phone: newContactPhone,
      };
      setContacts([...contacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setModalVisible(false);
    }
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
  };

  const cacheBuster = useMemo(() => `?t=${Date.now()}`, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil y Configuración</Text>

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


      <View style={styles.toneContainer}>
        <Text style={styles.label}>Tono preferido</Text>
        <View style={styles.toneOptions}>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Lluvia' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Lluvia')}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/Lluvia.png')}
                style={styles.toneIcon}
              />
            </View>
            <Text style={styles.toneText}>LLUVIA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Música' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Música')}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/Musica.png')}
                style={styles.toneIcon}
              />
            </View>
            <Text style={styles.toneText}>MÚSICA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Pájaros' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Pájaros')}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/Pajaro.png')}
                style={styles.toneIcon}
              />
            </View>
            <Text style={styles.toneText}>PÁJAROS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toneButton, selectedTone === 'Personalizado' && styles.toneButtonSelected]}
            onPress={() => setSelectedTone('Personalizado')}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/Personalizado.png')}
                style={styles.toneIcon}
              />
            </View>
            <Text style={styles.toneText}>PERSONALIZADO</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <View style={styles.emergencyContainer}>
        <Text style={styles.label}>Contactos de emergencia</Text>
        <View style={styles.contactsWrapper}>
          <ScrollView style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contact}>
                <View>
                  <Text style={styles.contactText}>{contact.name}</Text>
                  {contact.phone ? <Text style={styles.contactPhone}>{contact.phone}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveContact(contact.id)}
                >
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>Añadir contacto</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Añadir contacto de emergencia</Text>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Nombre:</Text>
              <TextInput
                style={styles.modalInput}
                value={newContactName}
                onChangeText={setNewContactName}
                placeholder="Ingresa el nombre"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Teléfono:</Text>
              <TextInput
                style={styles.modalInput}
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                placeholder="Ingresa el número"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setNewContactName('');
                  setNewContactPhone('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddContact}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10, 
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    width: 120,
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
    marginBottom: 15, 
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
    marginBottom: 15, 
  },
  toneOptions: {
    flexDirection: 'row',
    backgroundColor: '#00A19D',
    borderRadius: 6,
    padding: 10,
  },
  toneButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    flex: 1,
  },
  toneButtonSelected: {
    backgroundColor: '#E0E0E0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  toneIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  toneText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  themeContainer: {
    marginBottom: 15, 
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
    flex: 1, 
  },
  contactsWrapper: {
    flex: 1,
    position: 'relative',
  },
  contactsList: {
    flexGrow: 1, 
    marginBottom: 60,
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
  contactPhone: {
    fontSize: 12,
    color: '#666',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00A19D',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    width: 80,
  },
  modalInput: {
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#00A19D',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});