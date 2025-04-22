import React, { useState, useRef, useEffect } from "react";
import {SafeAreaView, View, StyleSheet, Text, ActivityIndicator} from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  animatedContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#ffffffcc",
    borderRadius: 15,
  },
  predictionTextContainer: {
    alignItems: "center",
  },
  predictionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
