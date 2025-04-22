import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { 
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#525FE1' 
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : 'white',
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#FFF',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Centinela' }} />
        <Stack.Screen name="Login" options={{ title: 'Inicio de Sesión' }} />
        <Stack.Screen name="Home" options={{ title: 'Home' }} />
        <Stack.Screen name="Registro" options={{ title: 'Registro' }} />
        <Stack.Screen name="Detección" options={{ title: 'Detección' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
