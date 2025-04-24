import React, { useState } from 'react';
import {View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet,} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Calibración() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.tituloPrincipal}>Calibración</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
});
