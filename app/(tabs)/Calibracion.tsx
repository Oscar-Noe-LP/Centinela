import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Calibracion() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibración</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});